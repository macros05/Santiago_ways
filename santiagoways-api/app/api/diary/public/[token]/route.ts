import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { handleApiError, notFound, ok } from '@lib/http';

// Public read-only endpoint for shared diary entries.
export async function GET(_req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await ctx.params;
    const entry = await prisma.diaryEntry.findUnique({
      where: { shareToken: token },
      include: {
        user: { select: { name: true, username: true, avatar: true } },
      },
    });
    if (!entry || entry.isPrivate) return notFound('Entry not found');
    return ok({
      id: entry.id,
      title: entry.title,
      body: entry.body,
      images: entry.images,
      mood: entry.mood,
      weather: entry.weather,
      date: entry.date,
      author: entry.user,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
