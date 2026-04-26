import { create } from 'zustand';
import { api } from '@lib/api';
import {
  getCurrentOfferings,
  getCustomerInfo,
  initializePurchases,
  purchasePackage,
  restorePurchases,
  syncWithBackend,
  type Plan,
  type PurchasesOfferings,
  type PurchasesPackage,
} from '@lib/purchases';

type SubResp = {
  plan: Plan;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  revenueCatId: string | null;
};

type SubscriptionState = {
  plan: Plan;
  status: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  isLoading: boolean;
  offerings: PurchasesOfferings | null;
  initialize: (userId: string) => Promise<void>;
  refresh: () => Promise<void>;
  loadOfferings: () => Promise<void>;
  purchase: (pkg: PurchasesPackage) => Promise<Plan | null>;
  syncFromRevenueCat: () => Promise<void>;
  restore: () => Promise<Plan | null>;
  setPlan: (plan: Plan) => void;
  reset: () => void;
};

export const useSubscription = create<SubscriptionState>((set, get) => ({
  plan: 'free',
  status: 'inactive',
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  isLoading: false,
  offerings: null,

  initialize: async (userId) => {
    await initializePurchases(userId);
    await get().refresh();
    void get().loadOfferings();
  },

  refresh: async () => {
    set({ isLoading: true });
    try {
      const data = await api<SubResp>('/subscriptions/me');
      set({
        plan: data.plan,
        status: data.status,
        currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : null,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd,
      });
    } catch {
      // unauthenticated or unreachable: stay on free
    } finally {
      set({ isLoading: false });
    }
  },

  loadOfferings: async () => {
    const offerings = await getCurrentOfferings();
    set({ offerings });
  },

  purchase: async (pkg) => {
    set({ isLoading: true });
    try {
      const info = await purchasePackage(pkg);
      if (!info) return null;
      const synced = await syncWithBackend(info);
      if (synced?.plan) {
        set({ plan: synced.plan, status: 'active' });
        return synced.plan;
      }
      await get().refresh();
      return get().plan;
    } finally {
      set({ isLoading: false });
    }
  },

  syncFromRevenueCat: async () => {
    const info = await getCustomerInfo();
    if (!info) {
      await get().refresh();
      return;
    }
    const synced = await syncWithBackend(info);
    if (synced?.plan) {
      set({ plan: synced.plan, status: 'active' });
    } else {
      await get().refresh();
    }
  },

  restore: async () => {
    set({ isLoading: true });
    try {
      const info = await restorePurchases();
      if (!info) return null;
      const synced = await syncWithBackend(info);
      if (synced?.plan) {
        set({ plan: synced.plan, status: 'active' });
        return synced.plan;
      }
      await get().refresh();
      return get().plan;
    } finally {
      set({ isLoading: false });
    }
  },

  setPlan: (plan) => set({ plan }),

  reset: () =>
    set({
      plan: 'free',
      status: 'inactive',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      offerings: null,
    }),
}));
