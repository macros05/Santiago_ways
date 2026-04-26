import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { forbidden, handleApiError, notFound, ok } from '@lib/http';

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string; stageId: string }> },
) {
  try {
    const params = await ctx.params;
    const auth = await getAuth(req);
    const pilgrimage = await prisma.pilgrimage.findUnique({ where: { id: params.id } });
    if (!pilgrimage) return notFound('Pilgrimage not found');
    if (pilgrimage.userId !== auth.sub) return forbidden();

    const stage = await prisma.stage.findUnique({ where: { id: params.stageId } });
    if (!stage) return notFound('Stage not found');

    const completion = await prisma.pilgrimageStage.update({
      where: { pilgrimageId_stageId: { pilgrimageId: pilgrimage.id, stageId: stage.id } },
      data: {
        status: 'completed',
        completedAt: new Date(),
        distanceWalked: stage.distanceKm,
      },
    });

    // Activate next stage if exists
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
    }

    // Update user totals
    await prisma.user.update({
      where: { id: auth.sub },
      data: { totalKm: { increment: stage.distanceKm } },
    });
    await prisma.pilgrimage.update({
      where: { id: pilgrimage.id },
      data: { totalKm: { increment: stage.distanceKm } },
    });

    return ok(completion);
  } catch (e) {
    return handleApiError(e);
  }
}
