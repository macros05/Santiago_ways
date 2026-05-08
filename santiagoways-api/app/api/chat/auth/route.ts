import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@lib/auth';
import { err, forbidden, handleApiError } from '@lib/http';
import { prisma } from '@lib/prisma';
import { canAccessPrivateChat } from '@lib/permissions';
import { getPusher } from '@lib/pusher';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    const user = await prisma.user.findUnique({
      where: { id: auth.sub },
      include: { subscription: true },
    });
    if (!canAccessPrivateChat(user)) {
      return forbidden('Private chat requires Compostelero plan');
    }
    const pusher = getPusher();
    if (!pusher) return err('Pusher not configured', 500, 'pusher_unconfigured');

    const form = await req.formData();
    const socketId = String(form.get('socket_id') ?? '');
    const channel = String(form.get('channel_name') ?? '');
    if (!socketId || !channel.startsWith('private-compostelero-')) {
      return err('Invalid channel', 400, 'invalid_channel');
    }
    const authResp = pusher.authorizeChannel(socketId, channel);
    return NextResponse.json(authResp);
  } catch (e) {
    return handleApiError(e);
  }
}
