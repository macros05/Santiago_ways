import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { created, err, handleApiError } from '@lib/http';

const CreateSchema = z.object({
  pilgrimageId: z.string().optional(),
  placeSlug: z.string().min(1).max(80),
  placeName: z.string().min(1).max(120),
  city: z.string().max(80).optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  method: z.enum(['qr', 'gps', 'manual']),
  // For GPS-validated stamps the client sends its current position so we can
  // require proximity (≤ 200m) — manual/qr trust the place coordinates.
  userLat: z.number().min(-90).max(90).optional(),
  userLng: z.number().min(-180).max(180).optional(),
});

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    const body = CreateSchema.parse(await req.json());

    if (body.method === 'gps') {
      if (body.userLat == null || body.userLng == null) {
        return err('GPS stamp requires user location', 400, 'invalid_request');
      }
      const dist = haversineMeters(
        { lat: body.userLat, lng: body.userLng },
        { lat: body.lat, lng: body.lng },
      );
      if (dist > 200) {
        return err(`Estás a ${Math.round(dist)}m del punto. Acércate a menos de 200m.`, 400, 'too_far');
      }
    }

    // Prisma can't upsert directly on a compound unique with a nullable field,
    // so we look it up first and decide.
    const existing = await prisma.credentialStamp.findFirst({
      where: {
        userId: auth.sub,
        pilgrimageId: body.pilgrimageId ?? null,
        placeSlug: body.placeSlug,
      },
    });
    const stamp = existing
      ? await prisma.credentialStamp.update({
          where: { id: existing.id },
          data: { stampedAt: new Date(), method: body.method },
        })
      : await prisma.credentialStamp.create({
          data: {
            userId: auth.sub,
            pilgrimageId: body.pilgrimageId,
            placeSlug: body.placeSlug,
            placeName: body.placeName,
            city: body.city,
            lat: body.lat,
            lng: body.lng,
            method: body.method,
          },
        });
    return created(stamp);
  } catch (e) {
    return handleApiError(e);
  }
}
