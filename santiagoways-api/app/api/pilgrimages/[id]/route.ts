import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { forbidden, handleApiError, notFound, ok } from '@lib/http';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const auth = await getAuth(req);
    const pilgrimage = await prisma.pilgrimage.findUnique({
      where: { id: params.id },
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
    if (!pilgrimage) return notFound('Pilgrimage not found');
    if (pilgrimage.userId !== auth.sub) return forbidden();
    return ok(pilgrimage);
  } catch (e) {
    return handleApiError(e);
  }
}

const patchSchema = z.object({
  status: z.enum(['planning', 'active', 'completed', 'paused']).optional(),
  endDate: z.string().datetime().nullable().optional(),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const auth = await getAuth(req);
    const body = patchSchema.parse(await req.json());

    const pilgrimage = await prisma.pilgrimage.findUnique({ where: { id: params.id } });
    if (!pilgrimage) return notFound('Pilgrimage not found');
    if (pilgrimage.userId !== auth.sub) return forbidden();

    const updated = await prisma.pilgrimage.update({
      where: { id: params.id },
      data: {
        status: body.status,
        endDate: body.endDate === null ? null : body.endDate ? new Date(body.endDate) : undefined,
      },
    });

    if (body.status === 'active') {
      await prisma.user.update({ where: { id: auth.sub }, data: { isOnCamino: true } });
    } else if (body.status === 'completed' || body.status === 'paused') {
      await prisma.user.update({ where: { id: auth.sub }, data: { isOnCamino: false } });
    }

    return ok(updated);
  } catch (e) {
    return handleApiError(e);
  }
}
