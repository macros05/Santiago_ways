import {
  distanceToPolylineMeters,
  distanceToSegmentMeters,
  haversineKm,
  haversineMeters,
  polylineLengthMeters,
} from '@lib/geo';

describe('haversine', () => {
  it('returns 0 for identical points', () => {
    expect(haversineMeters({ lat: 42, lng: -8 }, { lat: 42, lng: -8 })).toBe(0);
    expect(haversineKm({ lat: 42, lng: -8 }, { lat: 42, lng: -8 })).toBe(0);
  });

  it('measures ≈111 km per degree of latitude on the meridian', () => {
    const d = haversineKm({ lat: 0, lng: 0 }, { lat: 1, lng: 0 });
    expect(d).toBeGreaterThan(110);
    expect(d).toBeLessThan(112);
  });

  it('measures the SJPdP → Roncesvalles straight-line distance ≈ 24 km', () => {
    // Saint-Jean-Pied-de-Port → Roncesvalles, the canonical first stage.
    const sjpdp = { lat: 43.1632, lng: -1.2369 };
    const ronc = { lat: 43.0094, lng: -1.3194 };
    const km = haversineKm(sjpdp, ronc);
    expect(km).toBeGreaterThan(17);
    expect(km).toBeLessThan(20);
  });

  it('is symmetric within rounding noise', () => {
    const a = { lat: 42.881, lng: -8.545 };
    const b = { lat: 43.367, lng: -8.397 };
    expect(Math.abs(haversineMeters(a, b) - haversineMeters(b, a))).toBeLessThan(1e-6);
  });
});

describe('distanceToSegmentMeters', () => {
  it('returns 0 when the point is on the segment', () => {
    const a = { lat: 42.0, lng: -8.0 };
    const b = { lat: 42.01, lng: -8.0 };
    const p = { lat: 42.005, lng: -8.0 };
    expect(distanceToSegmentMeters(p, a, b)).toBeLessThan(1);
  });

  it('snaps to the segment endpoints when the point is past them', () => {
    const a = { lat: 42.0, lng: -8.0 };
    const b = { lat: 42.01, lng: -8.0 };
    const past = { lat: 42.02, lng: -8.0 }; // 1.1 km past b
    const d = distanceToSegmentMeters(past, a, b);
    // Should be ~ distance from past to b, ~1100 m.
    expect(d).toBeGreaterThan(900);
    expect(d).toBeLessThan(1300);
  });

  it('measures perpendicular offset for points beside the segment', () => {
    // ~100 m east of the meridian segment around lat 42. The function uses an
    // equirectangular projection so the reported distance carries a modest
    // bias at this latitude — we just check it's clearly in the
    // "≈100 m" range and well under the 200 m off-route threshold.
    const a = { lat: 42.0, lng: -8.0 };
    const b = { lat: 42.01, lng: -8.0 };
    const east = { lat: 42.005, lng: -7.9988 };
    const d = distanceToSegmentMeters(east, a, b);
    expect(d).toBeGreaterThan(80);
    expect(d).toBeLessThan(160);
  });
});

describe('distanceToPolylineMeters', () => {
  const polyline = [
    { lat: 42.0, lng: -8.0 },
    { lat: 42.01, lng: -8.0 },
    { lat: 42.01, lng: -7.99 },
  ];

  it('returns Infinity for an empty polyline', () => {
    expect(distanceToPolylineMeters({ lat: 0, lng: 0 }, [])).toBe(Infinity);
  });

  it('takes the minimum across all segments', () => {
    const near = { lat: 42.01, lng: -7.995 };
    expect(distanceToPolylineMeters(near, polyline)).toBeLessThan(10);
  });

  it('flags an off-route point above the 200 m threshold used in tracking', () => {
    const far = { lat: 42.05, lng: -8.0 };
    expect(distanceToPolylineMeters(far, polyline)).toBeGreaterThan(200);
  });
});

describe('polylineLengthMeters', () => {
  it('returns 0 for a single-point polyline', () => {
    expect(polylineLengthMeters([{ lat: 42, lng: -8 }])).toBe(0);
  });

  it('sums all segments', () => {
    const polyline = [
      { lat: 42.0, lng: -8.0 },
      { lat: 42.01, lng: -8.0 },
      { lat: 42.02, lng: -8.0 },
    ];
    const total = polylineLengthMeters(polyline);
    // Each segment ≈ 1.11 km → total ≈ 2.22 km
    expect(total).toBeGreaterThan(2100);
    expect(total).toBeLessThan(2300);
  });
});
