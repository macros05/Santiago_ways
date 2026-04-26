import type { Plan } from './permissions';

const RC_BASE = 'https://api.revenuecat.com/v1';

const ENTITLEMENT_TO_PLAN: Record<string, Plan> = {
  buen_camino: 'buen_camino',
  compostelero: 'compostelero',
};

export type RcEntitlement = {
  product_identifier: string;
  expires_date: string | null;
  unsubscribe_detected_at: string | null;
  billing_issues_detected_at: string | null;
};

export type RcSubscriber = {
  entitlements: Record<string, RcEntitlement>;
  subscriptions?: Record<
    string,
    {
      expires_date: string | null;
      unsubscribe_detected_at: string | null;
      billing_issues_detected_at: string | null;
    }
  >;
};

export async function fetchRevenueCatEntitlements(customerId: string): Promise<RcSubscriber> {
  const key = process.env.REVENUECAT_SECRET_KEY;
  if (!key) {
    return { entitlements: {} };
  }
  const res = await fetch(`${RC_BASE}/subscribers/${encodeURIComponent(customerId)}`, {
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    if (res.status === 404) return { entitlements: {} };
    throw new Error(`RevenueCat API error ${res.status}`);
  }
  const json = (await res.json()) as { subscriber: RcSubscriber };
  return json.subscriber;
}

export type PlanMapping = {
  plan: Plan;
  status: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
};

export function mapEntitlementToPlan(subscriber: RcSubscriber): PlanMapping {
  const now = Date.now();
  let bestPlan: Plan = 'free';
  let currentPeriodEnd: Date | null = null;
  let cancelAtPeriodEnd = false;
  let status = 'inactive';

  for (const [key, ent] of Object.entries(subscriber.entitlements ?? {})) {
    const mappedPlan = ENTITLEMENT_TO_PLAN[key];
    if (!mappedPlan) continue;
    const expires = ent.expires_date ? new Date(ent.expires_date) : null;
    if (expires && expires.getTime() < now) continue;
    const rank = mappedPlan === 'compostelero' ? 2 : 1;
    const bestRank = bestPlan === 'compostelero' ? 2 : bestPlan === 'buen_camino' ? 1 : 0;
    if (rank > bestRank) {
      bestPlan = mappedPlan;
      currentPeriodEnd = expires;
      cancelAtPeriodEnd = !!ent.unsubscribe_detected_at;
      status = ent.billing_issues_detected_at ? 'billing_issue' : 'active';
    }
  }

  return { plan: bestPlan, status, currentPeriodEnd, cancelAtPeriodEnd };
}

export type RcWebhookEvent = {
  type:
    | 'INITIAL_PURCHASE'
    | 'RENEWAL'
    | 'CANCELLATION'
    | 'EXPIRATION'
    | 'PRODUCT_CHANGE'
    | 'NON_RENEWING_PURCHASE'
    | 'BILLING_ISSUE'
    | 'SUBSCRIBER_ALIAS'
    | string;
  app_user_id: string;
  original_app_user_id?: string;
  product_id?: string;
  expiration_at_ms?: number;
  entitlement_ids?: string[];
};

export function planFromProductOrEntitlements(event: RcWebhookEvent): Plan {
  for (const id of event.entitlement_ids ?? []) {
    const mapped = ENTITLEMENT_TO_PLAN[id];
    if (mapped) return mapped;
  }
  const product = (event.product_id ?? '').toLowerCase();
  if (product.includes('compostelero')) return 'compostelero';
  if (product.includes('buen') || product.includes('camino')) return 'buen_camino';
  return 'free';
}
