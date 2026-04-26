import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { handleApiError, ok } from '@lib/http';

// Returns the current user's most relevant pilgrimage:
//   1. active (currently walking) — preferred
//   2. else the most recent (planning / paused / completed)
//   3. else null
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuth(req);

    const active = await prisma.pilgrimage.findFirst({
      where: { userId: auth.sub, status: 'active' },
      include: {
        route: true,
        stages: {
          orderBy: { stage: { number: 'asc' } },
          include: {
            stage: {
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
        },
      },
    });

    if (active) return ok(active);

    const fallback = await prisma.pilgrimage.findFirst({
      where: { userId: auth.sub },
      orderBy: { createdAt: 'desc' },
      include: {
        route: true,
        stages: {
          orderBy: { stage: { number: 'asc' } },
          include: {
            stage: {
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
        },
      },
    });

    return ok(fallback);
  } catch (e) {
    return handleApiError(e);
  }
}
