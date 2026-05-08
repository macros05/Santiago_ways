// Pure geometry helpers used across GPS tracking, off-route detection,
// and credential stamping.

export type LatLng = { lat: number; lng: number };

const R = 6371000; // metres
const toRad = (deg: number) => (deg * Math.PI) / 180;

export function haversineMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function haversineKm(a: LatLng, b: LatLng): number {
  return haversineMeters(a, b) / 1000;
}

// Distance from point P to segment AB, in metres. Uses an equirectangular
// projection — accurate enough for the ≤ 1 km segments along a stage track.
export function distanceToSegmentMeters(p: LatLng, a: LatLng, b: LatLng): number {
  const meanLat = ((a.lat + b.lat) / 2) * (Math.PI / 180);
  const xA = a.lng * Math.cos(meanLat);
  const xB = b.lng * Math.cos(meanLat);
  const xP = p.lng * Math.cos(meanLat);
  const yA = a.lat;
  const yB = b.lat;
  const yP = p.lat;
  const dx = xB - xA;
  const dy = yB - yA;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((xP - xA) * dx + (yP - yA) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const px = xA + t * dx;
  const py = yA + t * dy;
  // Convert back to metres using deg → metres factor at this latitude.
  const dLat = py - yP;
  const dLng = (px - xP) / Math.cos(meanLat);
  const dxMeters = dLng * 111_320;
  const dyMeters = dLat * 110_540;
  return Math.sqrt(dxMeters * dxMeters + dyMeters * dyMeters);
}

// Returns metres from `point` to the polyline (minimum across segments).
export function distanceToPolylineMeters(point: LatLng, polyline: LatLng[]): number {
  if (polyline.length === 0) return Infinity;
  if (polyline.length === 1) return haversineMeters(point, polyline[0]!);
  let best = Infinity;
  for (let i = 0; i < polyline.length - 1; i++) {
    const d = distanceToSegmentMeters(point, polyline[i]!, polyline[i + 1]!);
    if (d < best) best = d;
  }
  return best;
}

// Total length of a polyline in metres — used for distance-walked stats.
export function polylineLengthMeters(points: LatLng[]): number {
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += haversineMeters(points[i]!, points[i + 1]!);
  }
  return total;
}
