// GPS tracking foundation. Uses expo-location's foreground watcher plus an
// optional background task (registered separately) to record points while
// the screen is off. Points are buffered locally and synced to the API in
// best-effort batches; the local buffer survives app restarts via SQLite.
import * as Location from 'expo-location';
import * as SQLite from 'expo-sqlite';
import { create } from 'zustand';
import { api } from './api';
import { startBackgroundTracking, stopBackgroundTracking } from './backgroundTask';
import { distanceToPolylineMeters, haversineMeters, type LatLng } from './geo';

export type TrackPoint = {
  recordedAt: string;
  lat: number;
  lng: number;
  altitude: number | null;
  speed: number | null;
  accuracy: number | null;
};

const DB_NAME = 'sw_tracking.db';

let dbRef: SQLite.SQLiteDatabase | null = null;

async function getDb() {
  if (!dbRef) {
    dbRef = await SQLite.openDatabaseAsync(DB_NAME);
    await dbRef.execAsync(`
      CREATE TABLE IF NOT EXISTS gps_points (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pilgrimage_id TEXT NOT NULL,
        recorded_at TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        altitude REAL,
        speed REAL,
        accuracy REAL,
        synced INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_gps_synced ON gps_points (synced);
    `);
  }
  return dbRef;
}

export async function bufferPoint(pilgrimageId: string, p: TrackPoint) {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO gps_points (pilgrimage_id, recorded_at, lat, lng, altitude, speed, accuracy, synced) VALUES (?, ?, ?, ?, ?, ?, ?, 0)',
    [
      pilgrimageId,
      p.recordedAt,
      p.lat,
      p.lng,
      p.altitude,
      p.speed,
      p.accuracy,
    ],
  );
}

export async function syncBufferedPoints(pilgrimageId: string): Promise<number> {
  const db = await getDb();
  const rows = (await db.getAllAsync(
    'SELECT id, recorded_at as recordedAt, lat, lng, altitude, speed, accuracy FROM gps_points WHERE synced = 0 AND pilgrimage_id = ? ORDER BY recorded_at ASC LIMIT 200',
    [pilgrimageId],
  )) as Array<{ id: number } & TrackPoint>;
  if (rows.length === 0) return 0;
  try {
    await api('/gps/track', {
      method: 'POST',
      body: {
        pilgrimageId,
        points: rows.map((r) => ({
          recordedAt: r.recordedAt,
          lat: r.lat,
          lng: r.lng,
          altitude: r.altitude,
          speed: r.speed,
          accuracy: r.accuracy,
        })),
      },
    });
    const ids = rows.map((r) => r.id);
    await db.runAsync(
      `UPDATE gps_points SET synced = 1 WHERE id IN (${ids.map(() => '?').join(',')})`,
      ids,
    );
    return ids.length;
  } catch {
    return 0;
  }
}

export async function loadBufferedPoints(pilgrimageId: string): Promise<TrackPoint[]> {
  const db = await getDb();
  return (await db.getAllAsync(
    'SELECT recorded_at as recordedAt, lat, lng, altitude, speed, accuracy FROM gps_points WHERE pilgrimage_id = ? ORDER BY recorded_at ASC',
    [pilgrimageId],
  )) as TrackPoint[];
}

export async function clearBufferedPoints(pilgrimageId: string) {
  const db = await getDb();
  await db.runAsync('DELETE FROM gps_points WHERE pilgrimage_id = ?', [pilgrimageId]);
}

// ─── Live tracking store ──────────────────────────────────────────────────

type TrackingState = {
  isTracking: boolean;
  pilgrimageId: string | null;
  startedAt: number | null;
  distanceMeters: number;
  lastPoint: TrackPoint | null;
  offRoute: boolean; // true if last point > 200m off the planned polyline
  offRouteSince: number | null;
  routePolyline: LatLng[]; // current stage polyline
  start: (pilgrimageId: string, polyline: LatLng[]) => Promise<void>;
  stop: () => Promise<{ distanceMeters: number; durationMin: number; points: TrackPoint[] } | null>;
  _ingest: (raw: Location.LocationObject) => void;
  _watch: Location.LocationSubscription | null;
};

const OFF_ROUTE_METERS = 200;
const MIN_DISPLACEMENT = 5; // metres — discard duplicate points

export const useTracking = create<TrackingState>((set, get) => ({
  isTracking: false,
  pilgrimageId: null,
  startedAt: null,
  distanceMeters: 0,
  lastPoint: null,
  offRoute: false,
  offRouteSince: null,
  routePolyline: [],
  _watch: null,

  start: async (pilgrimageId, polyline) => {
    const fg = await Location.requestForegroundPermissionsAsync();
    if (!fg.granted) throw new Error('Location permission not granted');

    const sub = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 5_000, distanceInterval: 5 },
      (loc) => get()._ingest(loc),
    );
    set({
      isTracking: true,
      pilgrimageId,
      startedAt: Date.now(),
      distanceMeters: 0,
      lastPoint: null,
      offRoute: false,
      offRouteSince: null,
      routePolyline: polyline,
      _watch: sub,
    });
    startBackgroundTracking(pilgrimageId).catch((e) =>
      console.warn('[tracking] background start failed', e),
    );
  },

  stop: async () => {
    const state = get();
    state._watch?.remove();
    await stopBackgroundTracking().catch(() => {});
    if (!state.pilgrimageId || !state.startedAt) {
      set({ isTracking: false, _watch: null });
      return null;
    }
    const points = await loadBufferedPoints(state.pilgrimageId);
    const durationMin = Math.max(1, Math.round((Date.now() - state.startedAt) / 60_000));
    set({
      isTracking: false,
      pilgrimageId: null,
      startedAt: null,
      _watch: null,
      offRoute: false,
      offRouteSince: null,
    });
    void syncBufferedPoints(state.pilgrimageId);
    return { distanceMeters: state.distanceMeters, durationMin, points };
  },

  _ingest: (loc) => {
    const state = get();
    if (!state.isTracking || !state.pilgrimageId) return;
    const p: TrackPoint = {
      recordedAt: new Date(loc.timestamp).toISOString(),
      lat: loc.coords.latitude,
      lng: loc.coords.longitude,
      altitude: loc.coords.altitude ?? null,
      speed: loc.coords.speed ?? null,
      accuracy: loc.coords.accuracy ?? null,
    };
    let nextDistance = state.distanceMeters;
    if (state.lastPoint) {
      const d = haversineMeters(
        { lat: state.lastPoint.lat, lng: state.lastPoint.lng },
        { lat: p.lat, lng: p.lng },
      );
      if (d < MIN_DISPLACEMENT) return;
      // Cap unrealistic jumps (>1km in <30s) — likely a bad fix.
      if (d > 1000) return;
      nextDistance += d;
    }

    const offRouteDistance = state.routePolyline.length > 1
      ? distanceToPolylineMeters({ lat: p.lat, lng: p.lng }, state.routePolyline)
      : 0;
    const isOffRoute = offRouteDistance > OFF_ROUTE_METERS;

    set({
      lastPoint: p,
      distanceMeters: nextDistance,
      offRoute: isOffRoute,
      offRouteSince: isOffRoute ? state.offRouteSince ?? Date.now() : null,
    });
    void bufferPoint(state.pilgrimageId, p);
  },
}));

// Best-effort sync — call when the app comes back online.
export async function syncTrackingNow() {
  const state = useTracking.getState();
  if (!state.pilgrimageId) return 0;
  return syncBufferedPoints(state.pilgrimageId);
}
