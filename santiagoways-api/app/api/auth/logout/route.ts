import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@lib/prisma';
import { hashRefreshToken } from '@lib/jwt';
import { handleApiError, ok } from '@lib/http';

const schema = z.object({ refreshToken: z.string().min(1).optional() });

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = schema.parse(await req.json().catch(() => ({})));
    if (refreshToken) {
      const hash = hashRefreshToken(refreshToken);
      await prisma.refreshToken
        .update({ where: { tokenHash: hash }, data: { revokedAt: new Date() } })
        .catch(() => null);
    }
    return ok({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
