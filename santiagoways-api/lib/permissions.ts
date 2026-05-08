import { prisma } from './prisma';

export type Plan = 'free' | 'buen_camino' | 'compostelero';

export const PLAN_FEATURES = {
  free: {
    routes: 'francesOnly' as const,
    albergueLimit: 3,
    offlineMaps: false,
    communityPost: false,
    bookmarkLimit: 5,
    aiRecommendations: false,
    privateChat: false,
    health: false,
    ads: true,
  },
  buen_camino: {
    routes: 'all' as const,
    albergueLimit: Infinity,
    offlineMaps: true,
    communityPost: true,
    bookmarkLimit: Infinity,
    aiRecommendations: false,
    privateChat: false,
    health: false,
    ads: false,
  },
  compostelero: {
    routes: 'all' as const,
    albergueLimit: Infinity,
    offlineMaps: true,
    communityPost: true,
    bookmarkLimit: Infinity,
    aiRecommendations: true,
    privateChat: true,
    health: true,
    ads: false,
  },
} as const;

export type SubscriptionLite = {
  plan: string;
  status: string;
  currentPeriodEnd: Date | null;
} | null;

export type UserLike = { id: string; subscription?: SubscriptionLite } | { subscription: SubscriptionLite };

const ACTIVE_STATUSES = new Set(['active', 'trial']);

function normalizePlan(sub: SubscriptionLite): Plan {
  if (!sub) return 'free';
  if (!ACTIVE_STATUSES.has(sub.status)) return 'free';
  if (sub.currentPeriodEnd && sub.currentPeriodEnd.getTime() < Date.now()) return 'free';
  if (sub.plan === 'buen_camino' || sub.plan === 'compostelero') return sub.plan;
  return 'free';
}

export function getPlan(user: UserLike | null | undefined): Plan {
  if (!user) return 'free';
  const sub = (user as { subscription?: SubscriptionLite }).subscription ?? null;
  return normalizePlan(sub);
}

export async function getPlanForUserId(userId: string | null | undefined): Promise<Plan> {
  if (!userId) return 'free';
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  return normalizePlan(sub);
}

const PLAN_RANK: Record<Plan, number> = { free: 0, buen_camino: 1, compostelero: 2 };

export function planMeets(actual: Plan, required: Plan): boolean {
  return PLAN_RANK[actual] >= PLAN_RANK[required];
}

export function canAccessAllRoutes(user: UserLike | null): boolean {
  return planMeets(getPlan(user), 'buen_camino');
}

export function canAccessAllAlbergues(user: UserLike | null): boolean {
  return planMeets(getPlan(user), 'buen_camino');
}

export function canPostCommunity(user: UserLike | null): boolean {
  return planMeets(getPlan(user), 'buen_camino');
}

export function canUseOfflineMaps(user: UserLike | null): boolean {
  return planMeets(getPlan(user), 'buen_camino');
}

export function canUseAI(user: UserLike | null): boolean {
  return planMeets(getPlan(user), 'compostelero');
}

export function canAccessPrivateChat(user: UserLike | null): boolean {
  return planMeets(getPlan(user), 'compostelero');
}

export function canUseHealthIntegration(user: UserLike | null): boolean {
  return planMeets(getPlan(user), 'compostelero');
}

export function showAds(user: UserLike | null): boolean {
  return getPlan(user) === 'free';
}

export const FRANCES_SLUG = 'camino-frances';
