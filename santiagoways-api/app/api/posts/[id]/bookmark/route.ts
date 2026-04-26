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
    const existing = await prisma.bookmark.findUnique({
      where: { userId_postId: { userId: auth.sub, postId: post.id } },
    });
    if (existing) {
      await prisma.bookmark.delete({
        where: { userId_postId: { userId: auth.sub, postId: post.id } },
      });
      return ok({ bookmarked: false });
    }
    await prisma.bookmark.create({ data: { userId: auth.sub, postId: post.id } });
    return ok({ bookmarked: true });
  } catch (e) {
    return handleApiError(e);
  }
}
