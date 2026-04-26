import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { created, handleApiError } from '@lib/http';

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
      return new Response(JSON.stringify({ error: { message: 'Route not found' } }), { status: 404 });
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
