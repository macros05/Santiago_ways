import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { created, handleApiError, notFound } from '@lib/http';
import { checkRate, RATE_WRITE } from '@lib/rateLimit';

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const auth = await getAuth(req);
    const limited = await checkRate(req, `review:${auth.sub}`, RATE_WRITE);
    if (limited) return limited;
    const body = schema.parse(await req.json());

    // Reject reviews for albergues that don't exist (a raw create would only
    // fail on the FK, and otherwise lets clients probe).
    const albergue = await prisma.albergue.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!albergue) return notFound('Albergue not found');

    // One review per user per albergue: update in place instead of stacking
    // duplicates (rating-manipulation guard, backed by the @@unique index).
    const review = await prisma.albergueReview.upsert({
      where: { userId_albergueId: { userId: auth.sub, albergueId: params.id } },
      create: {
        userId: auth.sub,
        albergueId: params.id,
        rating: body.rating,
        comment: body.comment,
      },
      update: {
        rating: body.rating,
        comment: body.comment,
      },
    });
    return created(review);
  } catch (e) {
    return handleApiError(e);
  }
}
