import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@lib/api';
import {
  getTodaySnapshot,
  hasHealthPermission,
  isHealthAvailable,
  requestHealthPermissions,
  revokeHealthPermissions,
  syncToBackend,
  type HealthSnapshot,
} from '@lib/health';
import { useIsCompostelero } from './useSubscription';

export type HistoryResp = { days: number; items: ServerSnapshot[] };
export type ServerSnapshot = {
  id: string;
  date: string;
  steps: number | null;
  heartRateAvg: number | null;
  heartRateMax: number | null;
  calories: number | null;
  distanceKm: number | null;
  sleepHours: number | null;
  elevationM: number | null;
};

export function useHealthHistory(days = 7) {
  const enabled = useIsCompostelero();
  return useQuery({
    queryKey: ['health', 'history', days],
    queryFn: () => api<HistoryResp>('/health/history', { query: { days } }),
    enabled,
  });
}

export function useHealthSnapshotMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (snap: HealthSnapshot) => syncToBackend(snap),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['health'] }),
  });
}

export function useHealthPermission() {
  const [granted, setGranted] = useState<boolean | null>(null);
  const [available] = useState<boolean>(isHealthAvailable());

  useEffect(() => {
    hasHealthPermission().then(setGranted);
  }, []);

  const request = async () => {
    const ok = await requestHealthPermissions();
    setGranted(ok);
    return ok;
  };

  const revoke = async () => {
    await revokeHealthPermissions();
    setGranted(false);
  };

  return { available, granted, request, revoke };
}

export async function syncTodayIfPermitted() {
  if (!(await hasHealthPermission())) return;
  const snap = await getTodaySnapshot();
  if (!snap) return;
  try {
    await syncToBackend(snap);
  } catch {
    // ignore
  }
}
