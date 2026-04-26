import { NextRequest } from 'next/server';
import { getAuth } from '@lib/auth';
import { handleApiError, ok } from '@lib/http';
import { prisma } from '@lib/prisma';
import { getPlan } from '@lib/permissions';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    const sub = await prisma.subscription.findUnique({ where: { userId: auth.sub } });
    const plan = getPlan({ subscription: sub });
    return ok({
      plan,
      status: sub?.status ?? 'inactive',
      currentPeriodEnd: sub?.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
      revenueCatId: sub?.revenueCatId ?? null,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
