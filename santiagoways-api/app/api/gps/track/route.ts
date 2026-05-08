import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { forbidden, handleApiError, ok } from '@lib/http';

const PointSchema = z.object({
  recordedAt: z.string().datetime(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  altitude: z.number().nullable().optional(),
  speed: z.number().nullable().optional(),
  accuracy: z.number().nullable().optional(),
});

const BatchSchema = z.object({
  pilgrimageId: z.string(),
  points: z.array(PointSchema).min(1).max(500),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    const body = BatchSchema.parse(await req.json());
    const pilgrimage = await prisma.pilgrimage.findUnique({
      where: { id: body.pilgrimageId },
    });
    if (!pilgrimage) return ok({ inserted: 0 });
    if (pilgrimage.userId !== auth.sub) return forbidden();

    const data = body.points.map((p) => ({
      pilgrimageId: body.pilgrimageId,
      recordedAt: new Date(p.recordedAt),
      lat: p.lat,
      lng: p.lng,
      altitude: p.altitude ?? null,
      speed: p.speed ?? null,
      accuracy: p.accuracy ?? null,
    }));
    const result = await prisma.gpsPoint.createMany({ data, skipDuplicates: true });
    return ok({ inserted: result.count });
  } catch (e) {
    return handleApiError(e);
  }
}
