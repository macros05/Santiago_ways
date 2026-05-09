import { haversineMeters } from '@lib/geo';

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
  // Walk back from the latest segment counting how long the user has been still.
  let span = 0;
  for (let i = speeds.length - 1; i >= 0; i--) {
    if (speeds[i]! >= STILLNESS_KMH) break;
    const a = samples[i]!;
    const b = samples[i + 1]!;
    span += new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime();
  }
  return span;
}
