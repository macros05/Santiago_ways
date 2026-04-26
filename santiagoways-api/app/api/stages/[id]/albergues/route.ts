import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { getOptionalAuth } from '@lib/auth';
import { canAccessAllAlbergues, PLAN_FEATURES, getPlan } from '@lib/permissions';
import { handleApiError, ok } from '@lib/http';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const auth = await getOptionalAuth(req);
    const user = auth
      ? await prisma.user.findUnique({
          where: { id: auth.sub },
          include: { subscription: true },
        })
      : null;
    const plan = getPlan(user);
    const unlocked = canAccessAllAlbergues(user);
    const limit = unlocked ? Infinity : PLAN_FEATURES[plan].albergueLimit;

    const links = await prisma.stageAlbergue.findMany({
      where: { stageId: params.id },
      include: {
        albergue: {
          include: { reviews: { select: { rating: true } } },
        },
      },
    });

    const albergues = links.map(({ albergue }, idx) => {
      const ratings = albergue.reviews.map((r) => r.rating);
      const avg = ratings.length ? ratings.reduce((s, n) => s + n, 0) / ratings.length : null;
      const { reviews: _r, ...rest } = albergue;
      const isLocked = idx >= limit;
      if (isLocked) {
        return {
          id: rest.id,
          locked: true,
          preview: { name: rest.name, city: rest.city, type: rest.type, imageUrl: rest.imageUrl },
        };
      }
      return { ...rest, ratingAvg: avg, ratingCount: ratings.length };
    });

    return ok(albergues);
  } catch (e) {
    return handleApiError(e);
  }
}
