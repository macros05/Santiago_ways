import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { handleApiError, ok } from '@lib/http';

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

// Returns pilgrims who are sharing location and are within 25km.
// Privacy: requires shareLocation=true on both peers.
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    const me = await prisma.user.findUnique({
      where: { id: auth.sub },
      select: { currentLat: true, currentLng: true, shareLocation: true, isOnCamino: true },
    });
    if (!me?.shareLocation || me.currentLat == null || me.currentLng == null) {
      return ok([]);
    }

    const candidates = await prisma.user.findMany({
      where: {
        id: { not: auth.sub },
        shareLocation: true,
        isOnCamino: true,
        currentLat: { not: null },
        currentLng: { not: null },
        // Within rough lat/lng bounding box (~ ±0.3°) before exact filter.
        AND: [
          { currentLat: { gte: me.currentLat - 0.3 } },
          { currentLat: { lte: me.currentLat + 0.3 } },
          { currentLng: { gte: me.currentLng - 0.4 } },
          { currentLng: { lte: me.currentLng + 0.4 } },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        currentLat: true,
        currentLng: true,
        lastLocationAt: true,
        nationality: true,
      },
      take: 60,
    });

    const meAt = { lat: me.currentLat, lng: me.currentLng };
    const out = candidates
      .filter((c) => c.currentLat != null && c.currentLng != null)
      .map((c) => ({
        ...c,
        distanceKm: haversineKm(meAt, { lat: c.currentLat!, lng: c.currentLng! }),
      }))
      .filter((c) => c.distanceKm <= 25)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 20);

    return ok(out);
  } catch (e) {
    return handleApiError(e);
  }
}
