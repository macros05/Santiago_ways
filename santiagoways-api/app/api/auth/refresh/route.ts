import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@lib/prisma';
import { hashRefreshToken, signAccessToken, signRefreshToken, verifyRefreshToken } from '@lib/jwt';
import { err, handleApiError, ok } from '@lib/http';
import { checkRate, RATE_AUTH } from '@lib/rateLimit';

const schema = z.object({ refreshToken: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const limited = await checkRate(req, 'refresh', RATE_AUTH);
    if (limited) return limited;
    const { refreshToken } = schema.parse(await req.json());
    const { sub } = await verifyRefreshToken(refreshToken).catch(() => ({ sub: '' }));
    if (!sub) return err('Invalid refresh token', 401, 'invalid_refresh');

    const hash = hashRefreshToken(refreshToken);
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hash } });
    if (!stored) {
      return err('Refresh token expired', 401, 'expired_refresh');
    }
    // Replay detection: a token that we issued but already rotated away is being
    // presented again. Either it was stolen, or the legitimate client lost the
    // race. Revoke the whole family so neither party can keep using it.
    if (stored.revokedAt) {
      await prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      return err('Refresh token reuse detected', 401, 'reused_refresh');
    }
    if (stored.expiresAt < new Date()) {
      return err('Refresh token expired', 401, 'expired_refresh');
    }

    const user = await prisma.user.findUnique({ where: { id: sub } });
    if (!user) return err('User not found', 401, 'unauthorized');

    // Rotate
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });
    const next = await signRefreshToken(user.id);
    await prisma.refreshToken.create({
      data: { userId: user.id, tokenHash: next.hash, expiresAt: next.expiresAt },
    });
    const access = await signAccessToken({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    return ok({ accessToken: access, refreshToken: next.token });
  } catch (e) {
    return handleApiError(e);
  }
}
