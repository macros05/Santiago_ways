import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { getAuth, getOptionalAuth } from '@lib/auth';
import { forbidden, handleApiError, notFound, ok } from '@lib/http';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const auth = await getOptionalAuth(req);
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: { user: { select: { id: true, name: true, username: true, avatar: true } } },
        },
        _count: { select: { likes: true, comments: true } },
        likes: auth ? { where: { userId: auth.sub }, select: { userId: true } } : false,
        bookmarks: auth ? { where: { userId: auth.sub }, select: { userId: true } } : false,
      },
    });
    if (!post) return notFound('Post not found');
    return ok({
      ...post,
      likedByMe: 'likes' in post ? post.likes.length > 0 : false,
      bookmarkedByMe: 'bookmarks' in post ? post.bookmarks.length > 0 : false,
    });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const auth = await getAuth(req);
    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post) return notFound('Post not found');
    if (post.userId !== auth.sub) return forbidden();
    await prisma.post.delete({ where: { id: post.id } });
    return ok({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
