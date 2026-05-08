import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { created, forbidden, handleApiError, notFound, ok } from '@lib/http';

const trackSchema = z.object({
  coordinates: z
    .array(
      z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        timestamp: z.number().int(),
        altitude: z.number().nullable().optional(),
      }),
    )
    .min(2)
    .max(10_000),
  // A single Camino route is ~1000km, so 1500 caps any plausible single track.
  distanceKm: z.number().nonnegative().max(1500),
  durationMin: z.number().int().nonnegative().max(60 * 24 * 7),
});

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const auth = await getAuth(req);
    const pilgrimage = await prisma.pilgrimage.findUnique({ where: { id: params.id } });
    if (!pilgrimage) return notFound('Pilgrimage not found');
    if (pilgrimage.userId !== auth.sub) return forbidden();

    const body = trackSchema.parse(await req.json());
    const track = await prisma.gpsTrack.create({
      data: {
        pilgrimageId: pilgrimage.id,
        coordinates: body.coordinates,
        distanceKm: body.distanceKm,
        durationMin: body.durationMin,
      },
    });
    return created(track);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const auth = await getAuth(req);
    const pilgrimage = await prisma.pilgrimage.findUnique({ where: { id: params.id } });
    if (!pilgrimage) return notFound('Pilgrimage not found');
    if (pilgrimage.userId !== auth.sub) return forbidden();
    const tracks = await prisma.gpsTrack.findMany({
      where: { pilgrimageId: pilgrimage.id },
      orderBy: { recordedAt: 'desc' },
    });
    return ok(tracks);
  } catch (e) {
    return handleApiError(e);
  }
}
