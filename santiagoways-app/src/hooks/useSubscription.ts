import { useSubscription as useStore } from '@stores/subscription';
import type { Plan } from '@lib/purchases';

export type Feature =
  | 'all_routes'
  | 'all_albergues'
  | 'community_post'
  | 'offline_maps'
  | 'unlimited_bookmarks'
  | 'ai_recommendations'
  | 'private_chat'
  | 'health_integration';

const FEATURE_PLAN: Record<Feature, Plan> = {
  all_routes: 'buen_camino',
  all_albergues: 'buen_camino',
  community_post: 'buen_camino',
  offline_maps: 'buen_camino',
  unlimited_bookmarks: 'buen_camino',
  ai_recommendations: 'compostelero',
  private_chat: 'compostelero',
  health_integration: 'compostelero',
};

const PLAN_RANK: Record<Plan, number> = { free: 0, buen_camino: 1, compostelero: 2 };

export function planMeets(actual: Plan, required: Plan): boolean {
  return PLAN_RANK[actual] >= PLAN_RANK[required];
}

export function usePlan(): Plan {
  return useStore((s) => s.plan);
}

export function useCanAccess(feature: Feature): boolean {
  const plan = usePlan();
  return planMeets(plan, FEATURE_PLAN[feature]);
}

export function requiredPlanFor(feature: Feature): Plan {
  return FEATURE_PLAN[feature];
}

export function useShowAds(): boolean {
  return usePlan() === 'free';
}

export function useIsCompostelero(): boolean {
  return usePlan() === 'compostelero';
}

export function useIsBuenCaminoOrAbove(): boolean {
  const p = usePlan();
  return p === 'buen_camino' || p === 'compostelero';
}

export function useSubscriptionStatus() {
  return useStore((s) => ({
    plan: s.plan,
    status: s.status,
    currentPeriodEnd: s.currentPeriodEnd,
    cancelAtPeriodEnd: s.cancelAtPeriodEnd,
    isLoading: s.isLoading,
  }));
}
