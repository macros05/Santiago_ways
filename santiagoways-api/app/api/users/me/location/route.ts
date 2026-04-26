import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { handleApiError, ok } from '@lib/http';

const schema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    const body = schema.parse(await req.json());
    const user = await prisma.user.update({
      where: { id: auth.sub },
      data: {
        currentLat: body.lat,
        currentLng: body.lng,
        lastLocationAt: new Date(),
      },
      select: { id: true, currentLat: true, currentLng: true, lastLocationAt: true },
    });

    // TODO: trigger Pusher broadcast for live pilgrim map.
    return ok(user);
  } catch (e) {
    return handleApiError(e);
  }
}
