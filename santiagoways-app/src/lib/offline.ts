// expo-file-system v19 moved the file-URI helpers to the /legacy entry. The
// new (non-legacy) API is class-based and not yet stable enough for our
// download flow.
import * as FileSystem from 'expo-file-system/legacy';
import { api } from './api';

type OfflineManifest = {
  stageId: string;
  name: string;
  distanceKm: number;
  bbox: { minLng: number; minLat: number; maxLng: number; maxLat: number };
  estimatedBytes: number;
  mbtilesUrl: string | null;
  rasterTemplate: string;
  rasterZoomRange: [number, number];
};

const ROOT = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? ''}offline-maps/`;

async function ensureDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(ROOT);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(ROOT, { intermediates: true });
  }
}

function fileFor(stageId: string): string {
  return `${ROOT}stage-${stageId}.mbtiles`;
}

export async function isStageDownloaded(stageId: string): Promise<boolean> {
  if (!FileSystem.documentDirectory) return false;
  const info = await FileSystem.getInfoAsync(fileFor(stageId));
  return info.exists && (info as { size?: number }).size != null;
}

export async function getStageManifest(stageId: string): Promise<OfflineManifest> {
  return api<OfflineManifest>(`/stages/${stageId}/offline`);
}

export type DownloadProgress = { received: number; total: number };

/**
 * Downloads the MBTiles archive for a stage. Returns the local path on success.
 * If the API has no MBTiles URL configured yet, throws — caller should surface
 * a "próximamente" message instead.
 */
export async function downloadStageOffline(
  stageId: string,
  onProgress?: (p: DownloadProgress) => void,
): Promise<string> {
  const manifest = await getStageManifest(stageId);
  if (!manifest.mbtilesUrl) {
    throw new Error('MBTILES_BASE_URL_NOT_SET');
  }
  await ensureDir();
  const dest = fileFor(stageId);

  const task = FileSystem.createDownloadResumable(
    manifest.mbtilesUrl,
    dest,
    {},
    (p) => {
      onProgress?.({
        received: p.totalBytesWritten,
        total: p.totalBytesExpectedToWrite || manifest.estimatedBytes,
      });
    },
  );
  const result = await task.downloadAsync();
  if (!result?.uri) {
    throw new Error('Download cancelled');
  }
  return result.uri;
}

export async function deleteStageOffline(stageId: string): Promise<void> {
  const path = fileFor(stageId);
  const info = await FileSystem.getInfoAsync(path);
  if (info.exists) {
    await FileSystem.deleteAsync(path, { idempotent: true });
  }
}

export async function listDownloadedStages(): Promise<{ stageId: string; bytes: number }[]> {
  if (!FileSystem.documentDirectory) return [];
  const info = await FileSystem.getInfoAsync(ROOT);
  if (!info.exists) return [];
  const items = await FileSystem.readDirectoryAsync(ROOT);
  const out: { stageId: string; bytes: number }[] = [];
  for (const item of items) {
    const m = item.match(/^stage-(.+)\.mbtiles$/);
    if (!m) continue;
    const stat = await FileSystem.getInfoAsync(`${ROOT}${item}`);
    out.push({
      stageId: m[1]!,
      bytes: stat.exists ? ((stat as { size?: number }).size ?? 0) : 0,
    });
  }
  return out;
}
