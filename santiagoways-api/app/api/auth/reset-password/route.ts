import { NextRequest } from 'next/server';
import { z } from 'zod';
import crypto from 'node:crypto';
import argon2 from 'argon2';
import { prisma } from '@lib/prisma';
import { err, handleApiError, ok } from '@lib/http';
import { checkRate, RATE_AUTH } from '@lib/rateLimit';

const schema = z.object({
  token: z.string().min(16).max(256),
  password: z.string().min(8).max(128),
});

function tokenHash(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const limited = await checkRate(req, 'reset-password', RATE_AUTH);
    if (limited) return limited;

    const { token, password } = schema.parse(await req.json());

    const stored = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: tokenHash(token) },
    });
    if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
      return err('Reset link expired or already used', 400, 'invalid_reset_token');
    }

    const passwordHash = await argon2.hash(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: stored.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: stored.id },
        data: { usedAt: new Date() },
      }),
      // Invalidate any active sessions so the attacker scenario (token leaked
      // alongside an active refresh token) doesn't outlive the password change.
      prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return ok({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
