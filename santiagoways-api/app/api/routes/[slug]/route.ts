import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { handleApiError, notFound, ok } from '@lib/http';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const params = await ctx.params;
    const route = await prisma.route.findUnique({
      where: { slug: params.slug },
      include: {
        stages: {
          orderBy: { number: 'asc' },
          select: {
            id: true,
            number: true,
            name: true,
            startPoint: true,
            endPoint: true,
            distanceKm: true,
            elevationGain: true,
            elevationLoss: true,
            difficulty: true,
            imageUrl: true,
          },
        },
      },
    });
    if (!route) return notFound('Route not found');
    return ok(route);
  } catch (e) {
    return handleApiError(e);
  }
}
