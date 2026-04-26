import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { api } from './api';

export type HealthSnapshot = {
  date: string;
  steps?: number;
  heartRateAvg?: number;
  heartRateMax?: number;
  calories?: number;
  distanceKm?: number;
  sleepHours?: number;
  elevationM?: number;
};

const PERMISSION_KEY = 'sw_health_permission_granted';

let iosMod: typeof import('react-native-health') | null = null;
let healthConnectMod: typeof import('react-native-health-connect') | null = null;

function loadIos(): typeof import('react-native-health') | null {
  if (iosMod) return iosMod;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    iosMod = require('react-native-health');
    return iosMod;
  } catch {
    return null;
  }
}

function loadHealthConnect(): typeof import('react-native-health-connect') | null {
  if (healthConnectMod) return healthConnectMod;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    healthConnectMod = require('react-native-health-connect');
    return healthConnectMod;
  } catch {
    return null;
  }
}

export function isHealthAvailable(): boolean {
  return Platform.OS === 'ios' ? loadIos() !== null : loadHealthConnect() !== null;
}

export async function hasHealthPermission(): Promise<boolean> {
  const v = await SecureStore.getItemAsync(PERMISSION_KEY);
  return v === '1';
}

export async function requestHealthPermissions(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    const m = loadIos();
    if (!m) return false;
    try {
      // @ts-ignore - lib has dynamic shape
      const AppleHealthKit = (m as { default?: unknown }).default ?? m;
      const perms = {
        permissions: {
          // @ts-ignore
          read: [
            (AppleHealthKit as any).Constants?.Permissions?.Steps,
            (AppleHealthKit as any).Constants?.Permissions?.HeartRate,
            (AppleHealthKit as any).Constants?.Permissions?.ActiveEnergyBurned,
            (AppleHealthKit as any).Constants?.Permissions?.DistanceWalkingRunning,
            (AppleHealthKit as any).Constants?.Permissions?.FlightsClimbed,
            (AppleHealthKit as any).Constants?.Permissions?.SleepAnalysis,
          ].filter(Boolean),
          write: [],
        },
      };
      await new Promise<void>((resolve, reject) => {
        // @ts-ignore
        AppleHealthKit.initHealthKit(perms, (err: unknown) => (err ? reject(err) : resolve()));
      });
      await SecureStore.setItemAsync(PERMISSION_KEY, '1');
      return true;
    } catch (e) {
      console.warn('[health] iOS permission failed', e);
      return false;
    }
  }
  // Android: Health Connect
  const m = loadHealthConnect();
  if (!m) return false;
  try {
    // @ts-ignore
    const ok = await m.initialize();
    if (!ok) return false;
    // @ts-ignore
    await m.requestPermission([
      { accessType: 'read', recordType: 'Steps' },
      { accessType: 'read', recordType: 'HeartRate' },
      { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
      { accessType: 'read', recordType: 'Distance' },
      { accessType: 'read', recordType: 'SleepSession' },
      { accessType: 'read', recordType: 'ElevationGained' },
    ]);
    await SecureStore.setItemAsync(PERMISSION_KEY, '1');
    return true;
  } catch (e) {
    console.warn('[health] Android permission failed', e);
    return false;
  }
}

export async function revokeHealthPermissions(): Promise<void> {
  await SecureStore.deleteItemAsync(PERMISSION_KEY);
}

export async function getTodaySnapshot(): Promise<HealthSnapshot | null> {
  if (!(await hasHealthPermission())) return null;
  const today = startOfDay(new Date()).toISOString();

  if (Platform.OS === 'ios') {
    const m = loadIos();
    if (!m) return null;
    try {
      // @ts-ignore
      const AppleHealthKit = (m as { default?: unknown }).default ?? m;
      const opts = { startDate: startOfDay(new Date()).toISOString(), endDate: new Date().toISOString() };
      const steps = await iosOne<number>((cb) =>
        // @ts-ignore
        AppleHealthKit.getStepCount(opts, (err: unknown, r: { value: number }) =>
          cb(err, r?.value),
        ),
      );
      const calories = await iosOne<number>((cb) =>
        // @ts-ignore
        AppleHealthKit.getActiveEnergyBurned(opts, (err: unknown, r: any[]) =>
          cb(
            err,
            Array.isArray(r) ? r.reduce((s: number, x: any) => s + (x.value ?? 0), 0) : 0,
          ),
        ),
      );
      const distance = await iosOne<number>((cb) =>
        // @ts-ignore
        AppleHealthKit.getDistanceWalkingRunning(opts, (err: unknown, r: any) =>
          cb(err, r?.value),
        ),
      );
      return {
        date: today,
        steps: steps ?? undefined,
        calories: calories ?? undefined,
        distanceKm: distance ? distance / 1000 : undefined,
      };
    } catch {
      return { date: today };
    }
  }

  const m = loadHealthConnect();
  if (!m) return null;
  try {
    const start = startOfDay(new Date()).toISOString();
    const end = new Date().toISOString();
    // @ts-ignore
    const stepsRes = await m.readRecords('Steps', {
      timeRangeFilter: { operator: 'between', startTime: start, endTime: end },
    });
    const steps = stepsRes?.records?.reduce(
      (s: number, r: { count: number }) => s + (r.count ?? 0),
      0,
    );
    return { date: today, steps };
  } catch {
    return { date: today };
  }
}

export async function syncToBackend(snapshot: HealthSnapshot) {
  await api('/health/snapshot', {
    method: 'POST',
    body: snapshot,
  });
}

function iosOne<T>(call: (cb: (err: unknown, val: T | undefined) => void) => void): Promise<T | null> {
  return new Promise((resolve) => {
    let done = false;
    call((err, val) => {
      if (done) return;
      done = true;
      resolve(err || val == null ? null : val);
    });
    setTimeout(() => {
      if (!done) {
        done = true;
        resolve(null);
      }
    }, 5000);
  });
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
