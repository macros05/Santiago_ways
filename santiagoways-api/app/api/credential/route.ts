import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { handleApiError, ok } from '@lib/http';

const SANTIAGO_LAT = 42.881;
const SANTIAGO_LNG = -8.545;

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

// Returns the user's stamps for the active pilgrimage and Compostela eligibility.
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    const url = new URL(req.url);
    const pilgrimageId = url.searchParams.get('pilgrimageId') ?? undefined;

    const stamps = await prisma.credentialStamp.findMany({
      where: { userId: auth.sub, ...(pilgrimageId ? { pilgrimageId } : {}) },
      orderBy: { stampedAt: 'asc' },
    });

    // Eligibility: at least 2 stamps in the last 100km of the route.
    const last100km = stamps.filter((s) => haversineKm({ lat: s.lat, lng: s.lng }, { lat: SANTIAGO_LAT, lng: SANTIAGO_LNG }) <= 100);
    // We require ≥ 1 stamp/day — count distinct days.
    const days = new Set(last100km.map((s) => new Date(s.stampedAt).toISOString().slice(0, 10)));
    const compostelaEligible = days.size >= 2 && stamps.length >= 5;

    return ok({
      stamps,
      compostelaEligible,
      stampsLast100km: last100km.length,
      uniqueDaysLast100km: days.size,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
