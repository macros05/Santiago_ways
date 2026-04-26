import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { err, handleApiError, notFound, ok } from '@lib/http';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const auth = await getAuth(req);
    if (auth.sub === params.id) return err('Cannot follow yourself', 400);

    const target = await prisma.user.findUnique({ where: { id: params.id } });
    if (!target) return notFound('User not found');

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: auth.sub, followingId: target.id } },
    });
    if (existing) {
      await prisma.follow.delete({
        where: { followerId_followingId: { followerId: auth.sub, followingId: target.id } },
      });
      return ok({ following: false });
    }
    await prisma.follow.create({
      data: { followerId: auth.sub, followingId: target.id },
    });
    await prisma.notification.create({
      data: {
        userId: target.id,
        type: 'follow',
        title: 'New follower',
        body: 'Someone started following you',
        data: { fromUserId: auth.sub },
      },
    });
    return ok({ following: true });
  } catch (e) {
    return handleApiError(e);
  }
}
