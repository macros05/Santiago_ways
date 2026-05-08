import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { created, forbidden, handleApiError, notFound } from '@lib/http';
import { canAccessAllRoutes, FRANCES_SLUG } from '@lib/permissions';

const schema = z.object({
  routeSlug: z.string().min(1),
  startDate: z.string().datetime().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    const body = schema.parse(await req.json());
    const route = await prisma.route.findUnique({ where: { slug: body.routeSlug } });
    if (!route) {
      return notFound('Route not found');
    }
    if (route.slug !== FRANCES_SLUG) {
      const user = await prisma.user.findUnique({
        where: { id: auth.sub },
        include: { subscription: true },
      });
      if (!canAccessAllRoutes(user)) {
        return forbidden('This route requires Buen Camino plan');
      }
    }
    const stages = await prisma.stage.findMany({
      where: { routeId: route.id },
      orderBy: { number: 'asc' },
    });

    const pilgrimage = await prisma.pilgrimage.create({
      data: {
        userId: auth.sub,
        routeId: route.id,
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        status: 'planning',
        stages: {
          create: stages.map((s, i) => ({
            stageId: s.id,
            status: i === 0 ? 'active' : 'pending',
          })),
        },
      },
      include: { stages: true },
    });

    return created(pilgrimage);
  } catch (e) {
    return handleApiError(e);
  }
}
