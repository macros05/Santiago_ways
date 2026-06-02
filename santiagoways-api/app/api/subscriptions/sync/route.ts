import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAuth } from '@lib/auth';
import { handleApiError, ok } from '@lib/http';
import { prisma } from '@lib/prisma';
import { fetchRevenueCatEntitlements, mapEntitlementToPlan } from '@lib/revenuecat';
import { getPlan } from '@lib/permissions';

export const dynamic = 'force-dynamic';

// The body is accepted for backward compatibility but the RevenueCat customer
// id is NEVER trusted from the client. The mobile app configures Purchases with
// `appUserID = <local user id>` (see app/src/lib/purchases.ts), and the webhook
// keys on `app_user_id = <local user id>`, so the RC customer id is always the
// authenticated user's own id. Deriving it from `auth.sub` closes a privilege
// escalation where any user could sync another paying user's entitlements onto
// their own account by passing that user's id (which is exposed in many public
// responses).
const schema = z.object({ revenueCatCustomerId: z.string().min(1).optional() });

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    await req.json().then(schema.parse).catch(() => ({}));

    const revenueCatCustomerId = auth.sub;
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
