import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { prisma } from '@lib/prisma';
import { signAccessToken, signRefreshToken } from '@lib/jwt';
import { handleApiError, ok, err } from '@lib/http';
import { checkRate, RATE_AUTH } from '@lib/rateLimit';

// Apple's public JWKS endpoint. Cached by jose for ~10 minutes.
const APPLE_JWKS = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));
const APPLE_ISSUER = 'https://appleid.apple.com';

const schema = z.object({
  identityToken: z.string().min(10),
  // Apple only returns this on the very first sign-in. Subsequent sign-ins
  // must rely on the OAuthAccount lookup by sub.
  user: z
    .object({
      name: z.string().max(120).optional(),
      email: z.string().email().toLowerCase().optional(),
    })
    .optional(),
});

type AppleClaims = JWTPayload & {
  sub: string;
  email?: string;
  email_verified?: boolean | string;
  is_private_email?: boolean | string;
};

async function verifyAppleIdentityToken(token: string): Promise<AppleClaims> {
  const expectedAud = process.env.APPLE_CLIENT_ID;
  if (!expectedAud) {
    throw new Error('APPLE_CLIENT_ID is not configured');
  }
  const { payload } = await jwtVerify(token, APPLE_JWKS, {
    issuer: APPLE_ISSUER,
    audience: expectedAud,
  });
  if (typeof payload.sub !== 'string' || !payload.sub) {
    throw new Error('Apple token missing sub claim');
  }
  return payload as AppleClaims;
}

export async function POST(req: NextRequest) {
  try {
    const limited = await checkRate(req, 'oauth-apple', RATE_AUTH);
    if (limited) return limited;

    const body = schema.parse(await req.json());

    let claims: AppleClaims;
    try {
      claims = await verifyAppleIdentityToken(body.identityToken);
    } catch (e) {
      const reason = e instanceof Error ? e.message : 'verification failed';
      return err(`Invalid Apple identity token (${reason})`, 401, 'invalid_apple_token');
    }

    const appleSub = claims.sub;
    // Apple only sends `email` on the first auth and `user.email`/`user.name`
    // are passed by the client SDK. We fall back from the most-trusted source down.
    const email = (claims.email ?? body.user?.email ?? '').toLowerCase().trim();
    const name = body.user?.name?.trim() || (email ? email.split('@')[0]! : 'Pilgrim');

    const existing = await prisma.oAuthAccount.findUnique({
      where: { provider_providerId: { provider: 'apple', providerId: appleSub } },
      include: { user: true },
    });

    let user = existing?.user;
    if (!user) {
      // First-time sign-in: we need at least one stable email to create the user.
      // Apple's "hide my email" relays count — they're still unique.
      if (!email) {
        return err(
          'Apple did not return an email. Re-attempt sign-in and accept the email prompt.',
          422,
          'apple_email_missing',
        );
      }
      user = await prisma.user.upsert({
        where: { email },
        create: {
          email,
          name,
          username: await uniqueUsername(email),
          oauthAccounts: { create: { provider: 'apple', providerId: appleSub } },
        },
        update: {
          oauthAccounts: {
            connectOrCreate: {
              where: { provider_providerId: { provider: 'apple', providerId: appleSub } },
              create: { provider: 'apple', providerId: appleSub },
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

    return ok({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken: refresh.token,
    });
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
