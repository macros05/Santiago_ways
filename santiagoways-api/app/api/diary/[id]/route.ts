import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { forbidden, handleApiError, notFound, ok } from '@lib/http';

const PatchSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  body: z.string().min(1).max(8000).optional(),
  images: z.array(z.string().url()).max(10).optional(),
  mood: z.enum(['happy', 'tired', 'inspired', 'grateful', 'challenged']).optional(),
  weather: z.string().max(40).optional(),
  isPrivate: z.boolean().optional(),
});

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuth(req);
    const { id } = await ctx.params;
    const entry = await prisma.diaryEntry.findUnique({ where: { id } });
    if (!entry) return notFound('Diary entry not found');
    if (entry.userId !== auth.sub) return forbidden();
    return ok(entry);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuth(req);
    const { id } = await ctx.params;
    const existing = await prisma.diaryEntry.findUnique({ where: { id } });
    if (!existing) return notFound('Diary entry not found');
    if (existing.userId !== auth.sub) return forbidden();
    const data = PatchSchema.parse(await req.json());
    const entry = await prisma.diaryEntry.update({ where: { id }, data });
    return ok(entry);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuth(req);
    const { id } = await ctx.params;
    const existing = await prisma.diaryEntry.findUnique({ where: { id } });
    if (!existing) return notFound('Diary entry not found');
    if (existing.userId !== auth.sub) return forbidden();
    await prisma.diaryEntry.delete({ where: { id } });
    return ok({ id });
  } catch (e) {
    return handleApiError(e);
  }
}
