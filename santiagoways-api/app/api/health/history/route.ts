import { NextRequest } from 'next/server';
import { getAuth } from '@lib/auth';
import { handleApiError, forbidden, ok } from '@lib/http';
import { prisma } from '@lib/prisma';
import { canUseHealthIntegration } from '@lib/permissions';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    const user = await prisma.user.findUnique({
      where: { id: auth.sub },
      include: { subscription: true },
    });
    if (!canUseHealthIntegration(user)) {
      return forbidden('Health integration requires Compostelero plan');
    }
    const days = Math.min(90, Math.max(1, Number(req.nextUrl.searchParams.get('days') ?? 7)));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const items = await prisma.healthSnapshot.findMany({
      where: { userId: auth.sub, date: { gte: since } },
      orderBy: { date: 'asc' },
    });
    return ok({ days, items });
  } catch (e) {
    return handleApiError(e);
  }
}
