import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { handleApiError, ok } from '@lib/http';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    const favorites = await prisma.albergueFavorite.findMany({
      where: { userId: auth.sub },
      orderBy: { createdAt: 'desc' },
      include: {
        // We could include Albergue but the current schema doesn't expose
        // the relation on AlbergueFavorite (it's user-side only). So fetch
        // matching albergues in a second query.
      },
    });
    const albergueIds = favorites.map((f) => f.albergueId);
    const albergues = albergueIds.length
      ? await prisma.albergue.findMany({
          where: { id: { in: albergueIds } },
        })
      : [];
    return ok(albergues);
  } catch (e) {
    return handleApiError(e);
  }
}
