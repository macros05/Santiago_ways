import { NextRequest } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { forbidden, handleApiError, notFound, ok } from '@lib/http';

// Toggle a public share link for a diary entry. Returns the share token.
// DELETE removes the token (revokes the link).
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuth(req);
    const { id } = await ctx.params;
    const entry = await prisma.diaryEntry.findUnique({ where: { id } });
    if (!entry) return notFound('Diary entry not found');
    if (entry.userId !== auth.sub) return forbidden();
    const token = entry.shareToken ?? randomBytes(16).toString('hex');
    const updated = await prisma.diaryEntry.update({
      where: { id },
      data: { shareToken: token, isPrivate: false },
    });
    return ok({ shareToken: updated.shareToken });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuth(req);
    const { id } = await ctx.params;
    const entry = await prisma.diaryEntry.findUnique({ where: { id } });
    if (!entry) return notFound();
    if (entry.userId !== auth.sub) return forbidden();
    await prisma.diaryEntry.update({
      where: { id },
      data: { shareToken: null, isPrivate: true },
    });
    return ok({ id });
  } catch (e) {
    return handleApiError(e);
  }
}
