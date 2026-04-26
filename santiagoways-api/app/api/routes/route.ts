import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { handleApiError, ok } from '@lib/http';
import { getOptionalAuth } from '@lib/auth';
import { canAccessAllRoutes, FRANCES_SLUG } from '@lib/permissions';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await getOptionalAuth(req);
    const user = auth
      ? await prisma.user.findUnique({
          where: { id: auth.sub },
          include: { subscription: true },
        })
      : null;
    const unlocked = canAccessAllRoutes(user);

    const routes = await prisma.route.findMany({
      orderBy: { isPopular: 'desc' },
      include: { _count: { select: { stages: true } } },
    });

    if (unlocked) {
      return ok(routes);
    }

    const data = routes.map((r) => {
      if (r.slug === FRANCES_SLUG) return r;
      return {
        id: r.id,
        slug: r.slug,
        name: r.name,
        nameEn: r.nameEn,
        country: r.country,
        color: r.color,
        locked: true,
        preview: {
          imageUrl: r.imageUrl,
          totalKm: r.totalKm,
          difficulty: r.difficulty,
          startCity: r.startCity,
        },
      };
    });

    return ok(data);
  } catch (e) {
    return handleApiError(e);
  }
}
