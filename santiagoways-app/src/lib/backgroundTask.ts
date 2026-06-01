// Background GPS task. The TaskManager.defineTask call MUST be at the top
// level of this module so the task is registered as soon as the JS bundle
// loads — not inside hooks or components.
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { haversineMeters } from '@lib/geo';
import { bufferPoint, loadBufferedPoints, syncBufferedPoints } from '@lib/tracking';

export type GpsSample = {
  lat: number;
  lng: number;
  recordedAt: string;
};

export type Regime = {
  accuracy: 'high' | 'balanced';
  distanceInterval: number;
  timeInterval: number;
};

export const REGIME_HIGH: Regime = { accuracy: 'high', distanceInterval: 10, timeInterval: 5000 };
export const REGIME_BALANCED: Regime = { accuracy: 'balanced', distanceInterval: 50, timeInterval: 30000 };

const STILLNESS_KMH = 1;
const STILLNESS_MIN_MS = 5 * 60 * 1000;

export const BACKGROUND_LOCATION_TASK = 'sw-background-location';

let activePilgrimageId: string | null = null;
let activeRegime: Regime = REGIME_HIGH;

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.warn('[bgTask] error', error);
    return;
  }
  const pilgrimageId = activePilgrimageId;
  if (!pilgrimageId) return;
  const payload = data as { locations?: Location.LocationObject[] } | undefined;
  const locations = payload?.locations ?? [];
  if (locations.length === 0) return;

  for (const loc of locations) {
    await bufferPoint(pilgrimageId, {
      lat: loc.coords.latitude,
      lng: loc.coords.longitude,
      altitude: loc.coords.altitude ?? null,
      speed: loc.coords.speed ?? null,
      accuracy: loc.coords.accuracy ?? null,
      recordedAt: new Date(loc.timestamp).toISOString(),
    });
  }

  // Best-effort sync — never block the task if the network is down.
  syncBufferedPoints(pilgrimageId).catch(() => {});

  // Adaptive battery plan: peek at the latest buffered points and switch
  // regime if the user's movement profile changed.
  const recent = (await loadBufferedPoints(pilgrimageId)).slice(-10).map(toSample);
  const next = decideRegime(recent, activeRegime);
  if (next.accuracy !== activeRegime.accuracy) {
    activeRegime = next;
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK).catch(() => {});
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, buildOptions(activeRegime));
  }
});

export function decideRegime(samples: GpsSample[], current: Regime): Regime {
  if (samples.length < 2) return current;
  const speeds = computeSegmentSpeeds(samples);
  const recentKmh = speeds[speeds.length - 1] ?? 0;

  if (current.accuracy === 'balanced') {
    return recentKmh > STILLNESS_KMH ? REGIME_HIGH : REGIME_BALANCED;
  }

  // current is high: only drop to balanced if stillness has been sustained
  const stillnessSpan = stillnessSpanMs(samples, speeds);
  if (stillnessSpan >= STILLNESS_MIN_MS && recentKmh < STILLNESS_KMH) {
    return REGIME_BALANCED;
  }
  return REGIME_HIGH;
}

function computeSegmentSpeeds(samples: GpsSample[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < samples.length; i++) {
    const a = samples[i - 1]!;
    const b = samples[i]!;
    const meters = haversineMeters({ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng });
    const dtMs = new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime();
    if (dtMs <= 0) {
      out.push(0);
      continue;
    }
    const kmh = (meters / (dtMs / 1000)) * 3.6;
    out.push(kmh);
  }
  return out;
}

function stillnessSpanMs(samples: GpsSample[], speeds: number[]): number {
  let span = 0;
  for (let i = speeds.length - 1; i >= 0; i--) {
    if (speeds[i]! >= STILLNESS_KMH) break;
    const a = samples[i]!;
    const b = samples[i + 1]!;
    span += new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime();
  }
  return span;
}

function toSample(p: { lat: number; lng: number; recordedAt: string }): GpsSample {
  return { lat: p.lat, lng: p.lng, recordedAt: p.recordedAt };
}

function buildOptions(r: Regime): Location.LocationTaskOptions {
  return {
    accuracy: r.accuracy === 'high' ? Location.Accuracy.High : Location.Accuracy.Balanced,
    distanceInterval: r.distanceInterval,
    timeInterval: r.timeInterval,
    pausesUpdatesAutomatically: Platform.OS === 'ios',
    activityType: Location.LocationActivityType.Fitness,
    showsBackgroundLocationIndicator: true,
    foregroundService:
      Platform.OS === 'android'
        ? {
            notificationTitle: 'Trackeando tu etapa del Camino',
            notificationBody: 'Grabando tu posición. Toca para volver a la app.',
            notificationColor: '#F5C518',
          }
        : undefined,
  };
}

export async function startBackgroundTracking(pilgrimageId: string): Promise<void> {
  activePilgrimageId = pilgrimageId;
  activeRegime = REGIME_HIGH;
  const already = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK).catch(
    () => false,
  );
  if (already) return;
  const bg = await Location.requestBackgroundPermissionsAsync();
  if (bg.status !== 'granted') {
    console.warn('[bgTask] background permission denied');
    return;
  }
  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, buildOptions(activeRegime));
}

export async function stopBackgroundTracking(): Promise<void> {
  activePilgrimageId = null;
  const already = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK).catch(
    () => false,
  );
  if (already) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK).catch(() => {});
  }
}
