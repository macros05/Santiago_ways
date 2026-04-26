import { handleApiError, ok } from '@lib/http';
import { prisma } from '@lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    const featured = await prisma.featuredAlbergue.findMany({
      where: { startsAt: { lte: now }, endsAt: { gte: now } },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        albergue: {
          include: {
            reviews: { select: { rating: true } },
          },
        },
      },
    });
    const items = featured.map(({ albergue, priority, startsAt, endsAt }) => {
      const ratings = albergue.reviews.map((r) => r.rating);
      const avg = ratings.length ? ratings.reduce((s, n) => s + n, 0) / ratings.length : null;
      const { reviews: _r, ...rest } = albergue;
      return {
        ...rest,
        ratingAvg: avg,
        ratingCount: ratings.length,
        sponsored: true,
        priority,
        startsAt,
        endsAt,
      };
    });
    return ok(items);
  } catch (e) {
    return handleApiError(e);
  }
}
