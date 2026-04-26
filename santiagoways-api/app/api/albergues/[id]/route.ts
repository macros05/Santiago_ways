import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { handleApiError, notFound, ok } from '@lib/http';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const albergue = await prisma.albergue.findUnique({
      where: { id: params.id },
      include: {
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 25,
          include: {
            user: { select: { id: true, name: true, username: true, avatar: true } },
          },
        },
        stages: { include: { stage: { select: { id: true, name: true, number: true, route: { select: { slug: true, name: true } } } } } },
      },
    });
    if (!albergue) return notFound('Albergue not found');

    const ratings = albergue.reviews.map((r) => r.rating);
    const avg = ratings.length ? ratings.reduce((s, n) => s + n, 0) / ratings.length : null;
    return ok({ ...albergue, ratingAvg: avg, ratingCount: ratings.length });
  } catch (e) {
    return handleApiError(e);
  }
}
