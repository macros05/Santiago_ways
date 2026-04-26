import { NextRequest } from 'next/server';
import argon2 from 'argon2';
import { z } from 'zod';
import { prisma } from '@lib/prisma';
import { signAccessToken, signRefreshToken } from '@lib/jwt';
import { created, err, handleApiError } from '@lib/http';

const schema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(80),
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/),
  nationality: z.string().length(2).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());

    const exists = await prisma.user.findFirst({
      where: { OR: [{ email: body.email }, { username: body.username }] },
      select: { email: true, username: true },
    });
    if (exists) {
      const which = exists.email === body.email ? 'Email' : 'Username';
      return err(`${which} already in use`, 409, 'conflict');
    }

    const passwordHash = await argon2.hash(body.password);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        name: body.name,
        username: body.username,
        nationality: body.nationality,
      },
      select: { id: true, email: true, username: true, name: true, avatar: true },
    });

    const accessToken = await signAccessToken({
      sub: user.id,
      email: user.email,
      username: user.username,
    });
    const refresh = await signRefreshToken(user.id);
    await prisma.refreshToken.create({
      data: { userId: user.id, tokenHash: refresh.hash, expiresAt: refresh.expiresAt },
    });

    return created({ user, accessToken, refreshToken: refresh.token });
  } catch (e) {
    return handleApiError(e);
  }
}
