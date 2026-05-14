export type LatLng = { lat: number; lng: number };

export function haversineMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

// Reads the last vertex of a GeoJSON LineString stored in Prisma JSON. Returns
// null when the shape is missing or malformed so callers can fall back to a
// manual-only path instead of crashing.
export function lineStringEnd(coordinates: unknown): LatLng | null {
  if (!coordinates || typeof coordinates !== 'object') return null;
  const obj = coordinates as { type?: string; coordinates?: unknown };
  if (obj.type !== 'LineString' || !Array.isArray(obj.coordinates)) return null;
  const coords = obj.coordinates as unknown[];
  const last = coords[coords.length - 1];
  if (!Array.isArray(last) || last.length < 2) return null;
  const [lng, lat] = last as number[];
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  return { lat, lng };
}
