import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { getOptionalAuth } from '@lib/auth';
import { forbidden, handleApiError, notFound, ok, paginationParams } from '@lib/http';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const auth = await getOptionalAuth(req);
    const url = new URL(req.url);
    const { cursor, limit } = paginationParams(url.searchParams);

    const group = await prisma.pilgrimageGroup.findUnique({
      where: { id },
      select: { isPublic: true },
    });
    if (!group) return notFound('Group not found');

    if (!group.isPublic) {
      const member = auth
        ? await prisma.pilgrimageGroupMember.findUnique({
            where: { groupId_userId: { groupId: id, userId: auth.sub } },
            select: { userId: true },
          })
        : null;
      if (!member) return forbidden();
    }

    const members = await prisma.pilgrimageGroupMember.findMany({
      where: { groupId: id },
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { groupId_userId: { groupId: id, userId: cursor } } } : {}),
      orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
      include: {
        user: {
          select: { id: true, name: true, username: true, avatar: true, nationality: true },
        },
      },
    });

    const hasMore = members.length > limit;
    const items = members.slice(0, limit);
    return ok({
      items,
      nextCursor: hasMore ? items[items.length - 1]!.userId : null,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
