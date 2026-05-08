import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { handleApiError, notFound, ok } from '@lib/http';
import { getPlan } from '@lib/permissions';

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
        subscription: {
          select: {
            plan: true,
            status: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true,
          },
        },
      },
    });
    if (!user) return notFound('User not found');
    const plan = getPlan({ subscription: user.subscription ?? null });
    return ok({ ...user, plan });
  } catch (e) {
    return handleApiError(e);
  }
}
