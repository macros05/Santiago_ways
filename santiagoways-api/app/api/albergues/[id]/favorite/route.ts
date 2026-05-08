import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { handleApiError, ok } from '@lib/http';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuth(req);
    const { id } = await ctx.params;
    await prisma.albergueFavorite.upsert({
      where: { userId_albergueId: { userId: auth.sub, albergueId: id } },
      update: {},
      create: { userId: auth.sub, albergueId: id },
    });
    return ok({ favorited: true });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuth(req);
    const { id } = await ctx.params;
    await prisma.albergueFavorite.deleteMany({
      where: { userId: auth.sub, albergueId: id },
    });
    return ok({ favorited: false });
  } catch (e) {
    return handleApiError(e);
  }
}
