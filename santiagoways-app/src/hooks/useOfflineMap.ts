import { useEffect, useState } from 'react';
import { isStageDownloaded } from '@lib/offline';
import * as FileSystem from 'expo-file-system/legacy';

const ROOT = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? ''}offline-maps/`;

export type OfflineMapState = {
  available: boolean;
  path: string | null;
};

export function useOfflineMap(stageId?: string | null): OfflineMapState {
  const [state, setState] = useState<OfflineMapState>({ available: false, path: null });

  useEffect(() => {
    let cancelled = false;
    if (!stageId) {
      setState({ available: false, path: null });
      return () => {
        cancelled = true;
      };
    }
    (async () => {
      const downloaded = await isStageDownloaded(stageId);
      if (cancelled) return;
      setState({
        available: downloaded,
        path: downloaded ? `${ROOT}stage-${stageId}.mbtiles` : null,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [stageId]);

  return state;
}
