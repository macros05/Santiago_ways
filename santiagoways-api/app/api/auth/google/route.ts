import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@lib/prisma';
import { signAccessToken, signRefreshToken } from '@lib/jwt';
import { err, handleApiError, ok } from '@lib/http';

const schema = z.object({
  idToken: z.string().min(10),
});

// Validates a Google ID token via the public tokeninfo endpoint.
// In production, switch to the google-auth-library JWT verification.
async function verifyGoogleIdToken(idToken: string): Promise<{
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}> {
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!res.ok) throw new Error('Invalid Google id_token');
  const data = (await res.json()) as { sub: string; email: string; name?: string; picture?: string; aud?: string };
  if (process.env.GOOGLE_CLIENT_ID && data.aud && data.aud !== process.env.GOOGLE_CLIENT_ID) {
    throw new Error('Token audience mismatch');
  }
  return data;
}

export async function POST(req: NextRequest) {
  try {
    const { idToken } = schema.parse(await req.json());
    const profile = await verifyGoogleIdToken(idToken);

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

    return ok({ user, accessToken, refreshToken: refresh.token });
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
