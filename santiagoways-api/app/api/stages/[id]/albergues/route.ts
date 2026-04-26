import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { handleApiError, ok } from '@lib/http';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const links = await prisma.stageAlbergue.findMany({
      where: { stageId: params.id },
      include: {
        albergue: {
          include: {
            reviews: { select: { rating: true } },
          },
        },
      },
    });
    const albergues = links.map(({ albergue }) => {
      const ratings = albergue.reviews.map((r) => r.rating);
      const avg = ratings.length ? ratings.reduce((s, n) => s + n, 0) / ratings.length : null;
      const { reviews: _r, ...rest } = albergue;
      return { ...rest, ratingAvg: avg, ratingCount: ratings.length };
    });
    return ok(albergues);
  } catch (e) {
    return handleApiError(e);
  }
}
