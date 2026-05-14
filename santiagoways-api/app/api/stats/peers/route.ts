import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { handleApiError, ok } from '@lib/http';

export const dynamic = 'force-dynamic';

const QuerySchema = z.object({
  stageId: z.string().optional(),
  routeId: z.string().optional(),
});

// Cohort statistics so a peregrino can compare their pace to the median.
// Either stageId (per-stage average walking days) or routeId (per-route
// totals) — caller picks one. Excludes the current user.
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    const url = new URL(req.url);
    const params = QuerySchema.parse({
      stageId: url.searchParams.get('stageId') ?? undefined,
      routeId: url.searchParams.get('routeId') ?? undefined,
    });

    if (!params.stageId && !params.routeId) {
      return ok({ kind: 'empty' });
    }

    if (params.stageId) {
      const completions = await prisma.pilgrimageStage.findMany({
        where: {
          stageId: params.stageId,
          status: 'completed',
          startedAt: { not: null },
          completedAt: { not: null },
          pilgrimage: { userId: { not: auth.sub } },
        },
        select: { startedAt: true, completedAt: true, distanceWalked: true },
        take: 500,
      });
      if (completions.length === 0) {
        return ok({ kind: 'stage', sample: 0, medianHours: null, avgKm: 0 });
      }
      const hours = completions
        .map((c) => {
          if (!c.startedAt || !c.completedAt) return null;
          return (c.completedAt.getTime() - c.startedAt.getTime()) / 3_600_000;
        })
        .filter((h): h is number => h != null && h > 0 && h < 48)
        .sort((a, b) => a - b);
      const median = hours.length ? hours[Math.floor(hours.length / 2)]! : null;
      const avgKm =
        completions.reduce((n, c) => n + c.distanceWalked, 0) / completions.length;
      return ok({
        kind: 'stage',
        sample: completions.length,
        medianHours: median,
        avgKm,
      });
    }

    // routeId branch
    const pilgrimages = await prisma.pilgrimage.findMany({
      where: {
        routeId: params.routeId,
        status: 'completed',
        endDate: { not: null },
        userId: { not: auth.sub },
      },
      select: { totalKm: true, startDate: true, endDate: true },
      take: 500,
    });
    if (pilgrimages.length === 0) {
      return ok({ kind: 'route', sample: 0, medianDays: null, avgKm: 0 });
    }
    const days = pilgrimages
      .map((p) => {
        if (!p.endDate) return null;
        return (p.endDate.getTime() - p.startDate.getTime()) / 86_400_000;
      })
      .filter((d): d is number => d != null && d > 0 && d < 365)
      .sort((a, b) => a - b);
    const medianDays = days.length ? days[Math.floor(days.length / 2)]! : null;
    const avgKm = pilgrimages.reduce((n, p) => n + p.totalKm, 0) / pilgrimages.length;
    return ok({ kind: 'route', sample: pilgrimages.length, medianDays, avgKm });
  } catch (e) {
    return handleApiError(e);
  }
}
