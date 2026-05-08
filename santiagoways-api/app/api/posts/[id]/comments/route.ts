import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { created, handleApiError, notFound } from '@lib/http';
import { checkRate, RATE_WRITE } from '@lib/rateLimit';

const schema = z.object({ content: z.string().min(1).max(500) });

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const auth = await getAuth(req);
    const limited = await checkRate(req, `comment:${auth.sub}`, RATE_WRITE);
    if (limited) return limited;
    const body = schema.parse(await req.json());
    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post) return notFound('Post not found');
    const comment = await prisma.comment.create({
      data: { userId: auth.sub, postId: post.id, content: body.content },
      include: { user: { select: { id: true, name: true, username: true, avatar: true } } },
    });
    if (post.userId !== auth.sub) {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          type: 'comment',
          title: 'New comment',
          body: body.content.slice(0, 80),
          data: { postId: post.id, commentId: comment.id, fromUserId: auth.sub },
        },
      });
    }
    return created(comment);
  } catch (e) {
    return handleApiError(e);
  }
}
