import { NextRequest } from 'next/server';
import { getAuth } from '@lib/auth';
import { handleApiError, forbidden, ok } from '@lib/http';
import { prisma } from '@lib/prisma';
import { canAccessPrivateChat } from '@lib/permissions';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    const user = await prisma.user.findUnique({
      where: { id: auth.sub },
      include: { subscription: true },
    });
    if (!canAccessPrivateChat(user)) {
      return forbidden('Private chat requires Compostelero plan');
    }

    const rooms = await prisma.chatRoom.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { user: { select: { id: true, name: true, username: true } } },
        },
        _count: { select: { messages: true } },
      },
    });

    return ok(
      rooms.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        routeId: r.routeId,
        lastMessage: r.messages[0] ?? null,
        messageCount: r._count.messages,
      })),
    );
  } catch (e) {
    return handleApiError(e);
  }
}
