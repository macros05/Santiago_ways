import { handleApiError, ok } from '@lib/http';
import { prisma } from '@lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    const featured = await prisma.featuredAlbergue.findMany({
      where: { startsAt: { lte: now }, endsAt: { gte: now } },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: { albergue: true },
    });
    if (featured.length === 0) return ok([]);

    // Single aggregate query instead of loading every review row per albergue.
    const albergueIds = featured.map((f) => f.albergueId);
    const ratings = await prisma.albergueReview.groupBy({
      by: ['albergueId'],
      where: { albergueId: { in: albergueIds } },
      _avg: { rating: true },
      _count: { rating: true },
    });
    const ratingsById = new Map(ratings.map((r) => [r.albergueId, r]));

    const items = featured.map(({ albergue, priority, startsAt, endsAt }) => {
      const stat = ratingsById.get(albergue.id);
      return {
        ...albergue,
        ratingAvg: stat?._avg.rating ?? null,
        ratingCount: stat?._count.rating ?? 0,
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
