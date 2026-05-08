// Local stats / streak derived from the active pilgrimage's stages and
// diary entries. We compute on-device — no API call, recomputes when query
// data changes.
import { useMemo } from 'react';
import { useMyPilgrimage } from './usePilgrimage';
import { useDiaryEntries } from './useDiary';

function dayString(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

export function useStats() {
  const myQ = useMyPilgrimage();
  const diaryQ = useDiaryEntries();

  return useMemo(() => {
    const p = myQ.data;
    const completed = p?.stages.filter((s) => s.status === 'completed') ?? [];

    // Streak: consecutive days with a completed stage OR a diary entry.
    const days = new Set<string>();
    for (const c of completed) {
      if (c.completedAt) days.add(dayString(c.completedAt));
    }
    for (const e of diaryQ.data ?? []) {
      days.add(dayString(e.date));
    }

    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      if (days.has(dayString(d))) streak++;
      else if (i > 0) break;
    }

    const totalKm = completed.reduce((sum, s) => sum + s.distanceWalked, 0);
    const totalElevation = completed.reduce((sum, s) => sum + s.stage.elevationGain, 0);
    const photos = (diaryQ.data ?? []).reduce((sum, e) => sum + e.images.length, 0);

    return {
      streak,
      totalKm,
      totalElevation,
      stagesCompleted: completed.length,
      photos,
      diaryEntries: diaryQ.data?.length ?? 0,
    };
  }, [myQ.data, diaryQ.data]);
}
