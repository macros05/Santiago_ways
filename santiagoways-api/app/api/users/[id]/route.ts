import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { handleApiError, notFound, ok } from '@lib/http';

// Accepts either a user id (cuid) or a username — useful because the spec lists
// /api/users/:username for the profile but /api/users/:id/follow for follow.
// Next.js requires the same dynamic segment name at this depth, so we resolve here.
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const param = params.id;
    const user = await prisma.user.findFirst({
      where: { OR: [{ id: param }, { username: param }] },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        bio: true,
        nationality: true,
        timesCompleted: true,
        totalKm: true,
        isOnCamino: true,
        privateAccount: true,
        _count: { select: { posts: true, followers: true, following: true } },
      },
    });
    if (!user) return notFound('User not found');
    return ok(user);
  } catch (e) {
    return handleApiError(e);
  }
}
