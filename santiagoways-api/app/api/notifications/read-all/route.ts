import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { handleApiError, ok } from '@lib/http';

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    const result = await prisma.notification.updateMany({
      where: { userId: auth.sub, isRead: false },
      data: { isRead: true },
    });
    return ok({ updated: result.count });
  } catch (e) {
    return handleApiError(e);
  }
}
