import { NextRequest } from 'next/server';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@lib/prisma';
import { signAccessToken, signRefreshToken } from '@lib/jwt';
import { handleApiError, ok, err } from '@lib/http';
import { checkRate, RATE_AUTH } from '@lib/rateLimit';

const schema = z.object({
  idToken: z.string().min(10),
});

let _client: OAuth2Client | null = null;
function getClient(): OAuth2Client {
  if (_client) return _client;
  _client = new OAuth2Client();
  return _client;
}

// Validates a Google ID token cryptographically against Google's public keys
// (cached internally by google-auth-library) and checks the audience claim.
async function verifyGoogleIdToken(idToken: string): Promise<{
  sub: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
}> {
  const expectedAud = process.env.GOOGLE_CLIENT_ID;
  if (!expectedAud) {
    throw new Error('GOOGLE_CLIENT_ID is not configured');
  }
  // GOOGLE_CLIENT_ID may be a comma-separated list when ios/android/web each
  // have their own client id but share the same backend.
  const audiences = expectedAud.split(',').map((s) => s.trim()).filter(Boolean);

  const ticket = await getClient().verifyIdToken({
    idToken,
    audience: audiences.length === 1 ? audiences[0] : audiences,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.sub || !payload.email) {
    throw new Error('Google token missing required claims');
  }
  return {
    sub: payload.sub,
    email: payload.email.toLowerCase(),
    emailVerified: payload.email_verified === true,
    name: payload.name,
    picture: payload.picture,
  };
}

export async function POST(req: NextRequest) {
  try {
    const limited = await checkRate(req, 'oauth-google', RATE_AUTH);
    if (limited) return limited;
    const { idToken } = schema.parse(await req.json());

    let profile: Awaited<ReturnType<typeof verifyGoogleIdToken>>;
    try {
      profile = await verifyGoogleIdToken(idToken);
    } catch (e) {
      const reason = e instanceof Error ? e.message : 'verification failed';
      return err(`Invalid Google id_token (${reason})`, 401, 'invalid_google_token');
    }
    if (!profile.emailVerified) {
      return err('Google email is not verified', 401, 'email_not_verified');
    }

    const existing = await prisma.oAuthAccount.findUnique({
      where: { provider_providerId: { provider: 'google', providerId: profile.sub } },
      include: { user: true },
    });

    let user = existing?.user;
    if (!user) {
      user = await prisma.user.upsert({
        where: { email: profile.email },
        create: {
          email: profile.email,
          name: profile.name ?? profile.email.split('@')[0]!,
          username: await uniqueUsername(profile.email),
          avatar: profile.picture,
          oauthAccounts: { create: { provider: 'google', providerId: profile.sub } },
        },
        update: {
          oauthAccounts: {
            connectOrCreate: {
              where: { provider_providerId: { provider: 'google', providerId: profile.sub } },
              create: { provider: 'google', providerId: profile.sub },
            },
          },
        },
      });
    }

    const accessToken = await signAccessToken({
      sub: user.id,
      email: user.email,
      username: user.username,
    });
    const refresh = await signRefreshToken(user.id);
    await prisma.refreshToken.create({
      data: { userId: user.id, tokenHash: refresh.hash, expiresAt: refresh.expiresAt },
    });

    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      avatar: user.avatar,
    };
    return ok({ user: safeUser, accessToken, refreshToken: refresh.token });
  } catch (e) {
    return handleApiError(e);
  }
}

async function uniqueUsername(email: string): Promise<string> {
  const base = email.split('@')[0]!.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20) || 'pilgrim';
  for (let i = 0; i < 25; i++) {
    const candidate = i === 0 ? base : `${base}${i + 1}`;
    const exists = await prisma.user.findUnique({ where: { username: candidate } });
    if (!exists) return candidate;
  }
  return `${base}${Date.now().toString(36).slice(-4)}`;
}
