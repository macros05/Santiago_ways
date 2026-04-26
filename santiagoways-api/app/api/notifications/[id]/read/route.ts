import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { forbidden, handleApiError, notFound, ok } from '@lib/http';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const auth = await getAuth(req);
    const notif = await prisma.notification.findUnique({ where: { id: params.id } });
    if (!notif) return notFound('Notification not found');
    if (notif.userId !== auth.sub) return forbidden();
    const updated = await prisma.notification.update({
      where: { id: notif.id },
      data: { isRead: true },
    });
    return ok(updated);
  } catch (e) {
    return handleApiError(e);
  }
}
