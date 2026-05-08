import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { handleApiError, notFound, ok } from '@lib/http';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const auth = await getAuth(req);
    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post) return notFound('Post not found');

    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId: auth.sub, postId: post.id } },
    });

    if (existing) {
      await prisma.like.delete({
        where: { userId_postId: { userId: auth.sub, postId: post.id } },
      });
      // Best-effort cleanup of the matching unread notification on the post owner.
      if (post.userId !== auth.sub) {
        await prisma.notification.deleteMany({
          where: {
            userId: post.userId,
            type: 'like',
            isRead: false,
            AND: [
              { data: { path: ['postId'], equals: post.id } },
              { data: { path: ['fromUserId'], equals: auth.sub } },
            ],
          },
        });
      }
      return ok({ liked: false });
    }

    await prisma.like.create({ data: { userId: auth.sub, postId: post.id } });
    if (post.userId !== auth.sub) {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          type: 'like',
          title: 'New like',
          body: 'Someone liked your post',
          data: { postId: post.id, fromUserId: auth.sub },
        },
      });
    }
    return ok({ liked: true });
  } catch (e) {
    return handleApiError(e);
  }
}
