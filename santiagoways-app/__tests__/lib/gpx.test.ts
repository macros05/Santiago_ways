import { buildGpx } from '@lib/gpx';
import type { TrackPoint } from '@lib/tracking';

const point = (overrides: Partial<TrackPoint> = {}): TrackPoint => ({
  recordedAt: '2026-05-14T08:00:00.000Z',
  lat: 42.881,
  lng: -8.545,
  altitude: null,
  speed: null,
  accuracy: null,
  ...overrides,
});

describe('buildGpx', () => {
  it('emits a valid GPX 1.1 envelope with the supplied track name', () => {
    const xml = buildGpx([point()], 'Etapa 1');
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<gpx version="1.1"');
    expect(xml).toContain('<name>Etapa 1</name>');
    expect(xml).toContain('</gpx>');
  });

  it('serialises lat/lon to six decimals and embeds the recorded time', () => {
    const xml = buildGpx([
      point({ lat: 42.123456789, lng: -8.987654321, recordedAt: '2026-05-14T08:00:00.000Z' }),
    ]);
    expect(xml).toContain('lat="42.123457"');
    expect(xml).toContain('lon="-8.987654"');
    expect(xml).toContain('<time>2026-05-14T08:00:00.000Z</time>');
  });

  it('includes <ele> when altitude is set and omits it otherwise', () => {
    const withEle = buildGpx([point({ altitude: 532.7 })]);
    expect(withEle).toContain('<ele>532.7</ele>');
    const withoutEle = buildGpx([point({ altitude: null })]);
    expect(withoutEle).not.toContain('<ele>');
  });

  it('escapes XML-unsafe characters in the track name', () => {
    const xml = buildGpx([point()], 'Étapa <inicio> & "fin"');
    expect(xml).toContain('&lt;inicio&gt;');
    expect(xml).toContain('&amp;');
    expect(xml).toContain('&quot;fin&quot;');
    expect(xml).not.toContain('<inicio>');
  });

  it('produces an empty <trkseg> when there are no points', () => {
    const xml = buildGpx([]);
    expect(xml).toContain('<trkseg>');
    expect(xml).toContain('</trkseg>');
    expect(xml).not.toContain('<trkpt');
  });

  it('emits one <trkpt> per point in input order', () => {
    const pts = [
      point({ lat: 42.0, lng: -8.0, recordedAt: '2026-05-14T08:00:00.000Z' }),
      point({ lat: 42.1, lng: -8.1, recordedAt: '2026-05-14T08:30:00.000Z' }),
    ];
    const xml = buildGpx(pts);
    const matches = xml.match(/<trkpt /g) ?? [];
    expect(matches.length).toBe(2);
    expect(xml.indexOf('lat="42.000000"')).toBeLessThan(xml.indexOf('lat="42.100000"'));
  });
});
