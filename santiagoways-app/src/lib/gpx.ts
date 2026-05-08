// Build a GPX 1.1 document from a list of GPS points.
import type { TrackPoint } from './tracking';

const escapeXml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export function buildGpx(points: TrackPoint[], name = 'SantiagoWays Track'): string {
  const head = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="SantiagoWays" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>${escapeXml(name)}</name>
    <trkseg>`;
  const body = points
    .map((p) => {
      const ele = p.altitude != null ? `<ele>${p.altitude.toFixed(1)}</ele>` : '';
      const time = `<time>${new Date(p.recordedAt).toISOString()}</time>`;
      return `      <trkpt lat="${p.lat.toFixed(6)}" lon="${p.lng.toFixed(6)}">${ele}${time}</trkpt>`;
    })
    .join('\n');
  return `${head}
${body}
    </trkseg>
  </trk>
</gpx>`;
}
