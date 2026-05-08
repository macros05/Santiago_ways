// Lightweight analytics queue. Fire-and-forget, batched, robust against
// network drops. Events live in memory + AsyncStorage so we never lose them
// while offline; they ship in batches of ~20 or every 30s.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

type Event = {
  name: string;
  props?: Record<string, unknown>;
  ts: string;
};

const STORAGE_KEY = 'sw_analytics_queue_v1';
const FLUSH_INTERVAL_MS = 30_000;
const MAX_BATCH = 20;

let queue: Event[] = [];
let flushing = false;
let timer: ReturnType<typeof setInterval> | null = null;
let hydrated = false;

async function loadQueue() {
  if (hydrated) return;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) queue = JSON.parse(raw) as Event[];
  } catch {
    // Ignore corrupt cache.
    queue = [];
  }
  hydrated = true;
}

async function persist() {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue.slice(-200)));
  } catch {
    // Storage full / unavailable — drop silently.
  }
}

export async function track(name: string, props?: Record<string, unknown>) {
  await loadQueue();
  queue.push({ name, props, ts: new Date().toISOString() });
  await persist();
  if (queue.length >= MAX_BATCH) void flush();
}

export async function flush() {
  if (flushing) return;
  await loadQueue();
  if (queue.length === 0) return;
  flushing = true;
  const batch = queue.slice(0, MAX_BATCH);
  try {
    await api('/analytics/event', { method: 'POST', body: { events: batch } });
    queue = queue.slice(batch.length);
    await persist();
  } catch {
    // Network error: keep queue intact for next flush.
  } finally {
    flushing = false;
  }
}

export function startAnalytics() {
  if (timer) return;
  timer = setInterval(() => {
    void flush();
  }, FLUSH_INTERVAL_MS);
}

export function stopAnalytics() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

// Convenience helpers — keep names stable across the app.
export const Analytics = {
  onboardingStep: (step: string) => track('onboarding_step', { step }),
  onboardingCompleted: (totalMs: number) => track('onboarding_completed', { totalMs }),
  onboardingSkipped: (step: string) => track('onboarding_skipped', { step }),
  onboardingExploreWithoutAccount: () => track('onboarding_explore_no_account'),
  homeView: () => track('home_view'),
  stageView: (stageId: string) => track('stage_view', { stageId }),
  stageCompleted: (stageId: string, validated: 'gps' | 'manual') =>
    track('stage_completed', { stageId, validated }),
  albergueView: (albergueId: string) => track('albergue_view', { albergueId }),
  albergueFavorite: (albergueId: string, on: boolean) =>
    track('albergue_favorite', { albergueId, on }),
  diaryEntryCreated: (stageId?: string) => track('diary_entry_created', { stageId }),
  credentialStamp: (placeSlug: string, method: 'qr' | 'gps' | 'manual') =>
    track('credential_stamp', { placeSlug, method }),
  paywallShown: (feature: string) => track('paywall_shown', { feature }),
  paywallUpgrade: (feature: string, plan: string) =>
    track('paywall_upgrade', { feature, plan }),
  trackingStarted: () => track('tracking_started'),
  trackingStopped: (km: number, durationMin: number) =>
    track('tracking_stopped', { km, durationMin }),
};
