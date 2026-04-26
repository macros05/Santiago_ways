import { NextRequest } from 'next/server';
import argon2 from 'argon2';
import { z } from 'zod';
import { prisma } from '@lib/prisma';
import { signAccessToken, signRefreshToken } from '@lib/jwt';
import { err, handleApiError, ok } from '@lib/http';

const schema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !user.passwordHash) {
      return err('Invalid credentials', 401, 'invalid_credentials');
    }
    const valid = await argon2.verify(user.passwordHash, body.password);
    if (!valid) {
      return err('Invalid credentials', 401, 'invalid_credentials');
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
