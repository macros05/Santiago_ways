import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { handleApiError, notFound, ok } from '@lib/http';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    const user = await prisma.user.findUnique({
      where: { id: auth.sub },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        nationality: true,
        timesCompleted: true,
        totalKm: true,
        isOnCamino: true,
        privateAccount: true,
        shareLocation: true,
        language: true,
        createdAt: true,
      },
    });
    if (!user) return notFound('User not found');
    return ok(user);
  } catch (e) {
    return handleApiError(e);
  }
}
