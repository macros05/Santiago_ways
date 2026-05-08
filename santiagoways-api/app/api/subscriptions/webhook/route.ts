import { NextRequest } from 'next/server';
import { z } from 'zod';
import { handleApiError, err, ok } from '@lib/http';
import { prisma } from '@lib/prisma';
import { planFromProductOrEntitlements, type RcWebhookEvent } from '@lib/revenuecat';
import { assertProductionEnv } from '@lib/env';

export const dynamic = 'force-dynamic';

const eventSchema = z.object({
  event: z
    .object({
      type: z.string(),
      app_user_id: z.string(),
      original_app_user_id: z.string().optional(),
      product_id: z.string().optional(),
      expiration_at_ms: z.number().optional(),
      entitlement_ids: z.array(z.string()).optional(),
    })
    .passthrough(),
});

function verifySignature(req: NextRequest): boolean {
  const expected = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (!expected) {
    // In production we MUST have a secret configured — refuse to authorize the
    // webhook otherwise. In dev/preview we still allow it so local testing
    // works without RevenueCat secrets in the env.
    if (process.env.NODE_ENV === 'production') return false;
    return true;
  }
  const sig =
    req.headers.get('x-revenuecat-signature') ??
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
    '';
  if (!sig || sig.length !== expected.length) return false;
  // Constant-time compare to avoid leaking the secret via timing.
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function POST(req: NextRequest) {
  try {
    assertProductionEnv();
    if (!verifySignature(req)) {
      return err('Invalid webhook signature', 401, 'invalid_signature');
    }
    const json = await req.json();
    const { event } = eventSchema.parse(json);
    const userId = event.app_user_id;
    const periodEnd = event.expiration_at_ms ? new Date(event.expiration_at_ms) : null;
    const plan = planFromProductOrEntitlements(event as RcWebhookEvent);

    // Confirm the local user exists before upserting — RevenueCat may forward
    // events for aliased / anonymous app_user_ids that don't exist locally yet.
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!userExists) {
      return ok({ received: true, ignored: 'unknown_user' });
    }

    const existing = await prisma.subscription.findUnique({ where: { userId } });

    switch (event.type) {
      case 'INITIAL_PURCHASE':
      case 'NON_RENEWING_PURCHASE':
      case 'RENEWAL':
      case 'PRODUCT_CHANGE': {
        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            plan,
            status: 'active',
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false,
            revenueCatId: event.original_app_user_id ?? userId,
          },
          update: {
            plan,
            status: 'active',
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false,
            revenueCatId: event.original_app_user_id ?? existing?.revenueCatId ?? userId,
          },
        });
        break;
      }
      case 'CANCELLATION': {
        if (existing) {
          await prisma.subscription.update({
            where: { userId },
            data: { cancelAtPeriodEnd: true, status: 'cancelled' },
          });
        }
        break;
      }
      case 'EXPIRATION': {
        if (existing) {
          await prisma.subscription.update({
            where: { userId },
            data: { plan: 'free', status: 'expired', cancelAtPeriodEnd: false },
          });
        }
        break;
      }
      case 'BILLING_ISSUE': {
        if (existing) {
          await prisma.subscription.update({
            where: { userId },
            data: { status: 'billing_issue' },
          });
        }
        break;
      }
      default:
        break;
    }

    return ok({ received: true });
  } catch (e) {
    return handleApiError(e);
  }
}
