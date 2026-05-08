import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAuth } from '@lib/auth';
import { handleApiError, forbidden, notFound, ok, paginationParams } from '@lib/http';
import { prisma } from '@lib/prisma';
import { canAccessPrivateChat } from '@lib/permissions';
import { getPusher } from '@lib/pusher';
import { checkRate, RATE_WRITE } from '@lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuth(req);
    const user = await prisma.user.findUnique({
      where: { id: auth.sub },
      include: { subscription: true },
    });
    if (!canAccessPrivateChat(user)) {
      return forbidden('Private chat requires Compostelero plan');
    }
    const { id } = await ctx.params;
    const room = await prisma.chatRoom.findUnique({ where: { id } });
    if (!room) return notFound('Chat room not found');

    const { cursor, limit } = paginationParams(req.nextUrl.searchParams);
    const messages = await prisma.chatMessage.findMany({
      where: { roomId: id },
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, username: true, avatar: true } } },
    });
    const hasMore = messages.length > limit;
    const items = messages.slice(0, limit);
    return ok({
      items,
      nextCursor: hasMore ? items[items.length - 1]!.id : null,
    });
  } catch (e) {
    return handleApiError(e);
  }
}

const sendSchema = z.object({ content: z.string().min(1).max(1000) });

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuth(req);
    const limited = checkRate(req, `chat:${auth.sub}`, RATE_WRITE);
    if (limited) return limited;
    const user = await prisma.user.findUnique({
      where: { id: auth.sub },
      include: { subscription: true },
    });
    if (!canAccessPrivateChat(user)) {
      return forbidden('Private chat requires Compostelero plan');
    }
    const { id } = await ctx.params;
    const room = await prisma.chatRoom.findUnique({ where: { id } });
    if (!room) return notFound('Chat room not found');

    const { content } = sendSchema.parse(await req.json());
    const message = await prisma.chatMessage.create({
      data: { roomId: id, userId: auth.sub, content },
      include: { user: { select: { id: true, name: true, username: true, avatar: true } } },
    });

    const pusher = getPusher();
    if (pusher) {
      await pusher.trigger(`private-compostelero-${id}`, 'message', message).catch(() => {});
    }

    return ok(message, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
