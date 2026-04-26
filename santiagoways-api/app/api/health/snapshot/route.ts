import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAuth } from '@lib/auth';
import { handleApiError, forbidden, ok } from '@lib/http';
import { prisma } from '@lib/prisma';
import { canUseHealthIntegration } from '@lib/permissions';

export const dynamic = 'force-dynamic';

const schema = z.object({
  date: z.string().datetime().optional(),
  steps: z.number().int().min(0).optional(),
  heartRateAvg: z.number().int().min(0).optional(),
  heartRateMax: z.number().int().min(0).optional(),
  calories: z.number().int().min(0).optional(),
  distanceKm: z.number().min(0).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  elevationM: z.number().int().min(0).optional(),
});

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    const user = await prisma.user.findUnique({
      where: { id: auth.sub },
      include: { subscription: true },
    });
    if (!canUseHealthIntegration(user)) {
      return forbidden('Health integration requires Compostelero plan');
    }
    const body = schema.parse(await req.json());
    const date = startOfDay(body.date ? new Date(body.date) : new Date());

    const snapshot = await prisma.healthSnapshot.upsert({
      where: { userId_date: { userId: auth.sub, date } },
      create: {
        userId: auth.sub,
        date,
        steps: body.steps,
        heartRateAvg: body.heartRateAvg,
        heartRateMax: body.heartRateMax,
        calories: body.calories,
        distanceKm: body.distanceKm,
        sleepHours: body.sleepHours,
        elevationM: body.elevationM,
      },
      update: {
        steps: body.steps,
        heartRateAvg: body.heartRateAvg,
        heartRateMax: body.heartRateMax,
        calories: body.calories,
        distanceKm: body.distanceKm,
        sleepHours: body.sleepHours,
        elevationM: body.elevationM,
      },
    });
    return ok(snapshot);
  } catch (e) {
    return handleApiError(e);
  }
}
