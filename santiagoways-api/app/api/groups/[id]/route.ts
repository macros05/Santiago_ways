import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@lib/prisma';
import { getAuth, getOptionalAuth } from '@lib/auth';
import { forbidden, handleApiError, notFound, ok } from '@lib/http';

export const dynamic = 'force-dynamic';

const PatchSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  description: z.string().max(2000).nullable().optional(),
  isPublic: z.boolean().optional(),
  coverImage: z.string().url().nullable().optional(),
});

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const auth = await getOptionalAuth(req);

    const group = await prisma.pilgrimageGroup.findUnique({
      where: { id },
      include: {
        route: { select: { slug: true, name: true, color: true } },
        owner: { select: { id: true, name: true, username: true, avatar: true } },
        members: {
          take: 30,
          orderBy: { joinedAt: 'asc' },
          include: {
            user: { select: { id: true, name: true, username: true, avatar: true } },
          },
        },
        _count: { select: { members: true } },
      },
    });
    if (!group) return notFound('Group not found');

    const isMember = auth ? group.members.some((m) => m.userId === auth.sub) : false;
    if (!group.isPublic && !isMember) return forbidden();

    const memberOfMe = auth ? group.members.find((m) => m.userId === auth.sub) ?? null : null;
    return ok({ ...group, role: memberOfMe?.role ?? null, joined: !!memberOfMe });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const auth = await getAuth(req);
    const body = PatchSchema.parse(await req.json());

    const group = await prisma.pilgrimageGroup.findUnique({ where: { id } });
    if (!group) return notFound('Group not found');
    if (group.ownerId !== auth.sub) return forbidden();

    const updated = await prisma.pilgrimageGroup.update({
      where: { id },
      data: body,
    });
    return ok(updated);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const auth = await getAuth(_req);
    const group = await prisma.pilgrimageGroup.findUnique({ where: { id } });
    if (!group) return notFound('Group not found');
    if (group.ownerId !== auth.sub) return forbidden();
    await prisma.pilgrimageGroup.delete({ where: { id } });
    return ok({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
