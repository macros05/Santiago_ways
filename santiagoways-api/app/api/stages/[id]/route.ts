import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { handleApiError, notFound, ok } from '@lib/http';
import { getOptionalAuth } from '@lib/auth';
import { canUseOfflineMaps } from '@lib/permissions';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const auth = await getOptionalAuth(req);
    const user = auth
      ? await prisma.user.findUnique({
          where: { id: auth.sub },
          include: { subscription: true },
        })
      : null;
    const stage = await prisma.stage.findUnique({
      where: { id: params.id },
      include: {
        route: { select: { id: true, slug: true, name: true, color: true } },
        waypoints: { orderBy: { name: 'asc' } },
      },
    });
    if (!stage) return notFound('Stage not found');
    return ok({ ...stage, offlineAvailable: canUseOfflineMaps(user) });
  } catch (e) {
    return handleApiError(e);
  }
}
