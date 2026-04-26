import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAuth } from '@lib/auth';
import { handleApiError, ok } from '@lib/http';
import { prisma } from '@lib/prisma';
import { fetchRevenueCatEntitlements, mapEntitlementToPlan } from '@lib/revenuecat';
import { getPlan } from '@lib/permissions';

export const dynamic = 'force-dynamic';

const schema = z.object({ revenueCatCustomerId: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    const { revenueCatCustomerId } = schema.parse(await req.json());

    const entitlements = await fetchRevenueCatEntitlements(revenueCatCustomerId);
    const { plan, status, currentPeriodEnd, cancelAtPeriodEnd } = mapEntitlementToPlan(entitlements);

    const sub = await prisma.subscription.upsert({
      where: { userId: auth.sub },
      create: {
        userId: auth.sub,
        plan,
        status,
        revenueCatId: revenueCatCustomerId,
        currentPeriodEnd,
        cancelAtPeriodEnd,
      },
      update: {
        plan,
        status,
        revenueCatId: revenueCatCustomerId,
        currentPeriodEnd,
        cancelAtPeriodEnd,
      },
    });

    return ok({
      plan: getPlan({ subscription: sub }),
      status: sub.status,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
