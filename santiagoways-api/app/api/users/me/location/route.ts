import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { handleApiError, ok } from '@lib/http';
import { getPusher } from '@lib/pusher';

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
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        nationality: true,
        currentLat: true,
        currentLng: true,
        lastLocationAt: true,
        isOnCamino: true,
        shareLocation: true,
      },
    });

    // Only broadcast when the user has explicitly opted in to live location
    // sharing AND is currently on the Camino. This is the privacy contract
    // surfaced in /settings/privacy.
    if (user.shareLocation && user.isOnCamino) {
      const pusher = getPusher();
      if (pusher) {
        await pusher
          .trigger('live-pilgrims', 'location', {
            id: user.id,
            username: user.username,
            name: user.name,
            avatar: user.avatar,
            nationality: user.nationality,
            lat: user.currentLat,
            lng: user.currentLng,
            at: user.lastLocationAt,
          })
          .catch((e) => {
            console.error('[location] pusher trigger failed', e);
          });
      }
    }

    return ok({
      id: user.id,
      currentLat: user.currentLat,
      currentLng: user.currentLng,
      lastLocationAt: user.lastLocationAt,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
