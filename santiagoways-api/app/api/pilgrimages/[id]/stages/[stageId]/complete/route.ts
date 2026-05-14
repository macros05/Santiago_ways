import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { err, forbidden, handleApiError, notFound, ok } from '@lib/http';
import { haversineMeters, lineStringEnd } from '@lib/geo';
import { evaluateAchievements } from '@lib/achievements';

const PROXIMITY_METERS = 500;

const BodySchema = z
  .object({
    userLat: z.number().min(-90).max(90).optional(),
    userLng: z.number().min(-180).max(180).optional(),
    method: z.enum(['gps', 'manual']).default('manual'),
  })
  .default({ method: 'manual' });

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string; stageId: string }> },
) {
  try {
    const params = await ctx.params;
    const auth = await getAuth(req);

    const body = BodySchema.parse(await req.json().catch(() => ({})));

    const pilgrimage = await prisma.pilgrimage.findUnique({ where: { id: params.id } });
    if (!pilgrimage) return notFound('Pilgrimage not found');
    if (pilgrimage.userId !== auth.sub) return forbidden();

    const stage = await prisma.stage.findUnique({ where: { id: params.stageId } });
    if (!stage) return notFound('Stage not found');

    let validated: 'gps' | 'manual' = 'manual';
    if (body.method === 'gps') {
      if (body.userLat == null || body.userLng == null) {
        return err('GPS completion requires user location', 400, 'invalid_request');
      }
      const endPoint = lineStringEnd(stage.coordinates);
      if (!endPoint) {
        return err('Stage geometry unavailable for GPS validation', 400, 'no_geometry');
      }
      const dist = haversineMeters({ lat: body.userLat, lng: body.userLng }, endPoint);
      if (dist > PROXIMITY_METERS) {
        return err(
          `Estás a ${Math.round(dist)}m del final. Acércate a menos de ${PROXIMITY_METERS}m.`,
          400,
          'too_far',
          { distance: Math.round(dist), threshold: PROXIMITY_METERS },
        );
      }
      validated = 'gps';
    }

    const completion = await prisma.pilgrimageStage.update({
      where: { pilgrimageId_stageId: { pilgrimageId: pilgrimage.id, stageId: stage.id } },
      data: {
        status: 'completed',
        completedAt: new Date(),
        distanceWalked: stage.distanceKm,
      },
    });

    const next = await prisma.stage.findFirst({
      where: { routeId: stage.routeId, number: { gt: stage.number } },
      orderBy: { number: 'asc' },
    });
    if (next) {
      await prisma.pilgrimageStage.update({
        where: { pilgrimageId_stageId: { pilgrimageId: pilgrimage.id, stageId: next.id } },
        data: { status: 'active', startedAt: new Date() },
      });
    } else {
      await prisma.pilgrimage.update({
        where: { id: pilgrimage.id },
        data: { status: 'completed', endDate: new Date() },
      });
      await prisma.user.update({
        where: { id: auth.sub },
        data: { timesCompleted: { increment: 1 } },
      });
    }

    await prisma.user.update({
      where: { id: auth.sub },
      data: { totalKm: { increment: stage.distanceKm } },
    });
    await prisma.pilgrimage.update({
      where: { id: pilgrimage.id },
      data: { totalKm: { increment: stage.distanceKm } },
    });

    const newlyUnlocked = await evaluateAchievements(auth.sub, 'stage_completed').catch(
      () => [] as Awaited<ReturnType<typeof evaluateAchievements>>,
    );

    return ok({ ...completion, validated, unlocked: newlyUnlocked });
  } catch (e) {
    return handleApiError(e);
  }
}
