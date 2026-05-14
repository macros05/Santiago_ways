import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { err, forbidden, handleApiError, notFound, ok } from '@lib/http';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const auth = await getAuth(req);

    const group = await prisma.pilgrimageGroup.findUnique({ where: { id } });
    if (!group) return notFound('Group not found');
    if (!group.isPublic) return forbidden('Group is private');

    const membership = await prisma.pilgrimageGroupMember.upsert({
      where: { groupId_userId: { groupId: id, userId: auth.sub } },
      update: {},
      create: { groupId: id, userId: auth.sub, role: 'member' },
    });
    return ok(membership);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const auth = await getAuth(req);

    const group = await prisma.pilgrimageGroup.findUnique({ where: { id } });
    if (!group) return notFound('Group not found');
    if (group.ownerId === auth.sub) {
      return err('Owner cannot leave their own group; delete it instead', 400, 'owner_cannot_leave');
    }

    await prisma.pilgrimageGroupMember.deleteMany({
      where: { groupId: id, userId: auth.sub },
    });
    return ok({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
