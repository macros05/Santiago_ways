import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { created, handleApiError } from '@lib/http';

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const params = await ctx.params;
    const auth = await getAuth(req);
    const body = schema.parse(await req.json());
    const review = await prisma.albergueReview.create({
      data: {
        userId: auth.sub,
        albergueId: params.id,
        rating: body.rating,
        comment: body.comment,
      },
    });
    return created(review);
  } catch (e) {
    return handleApiError(e);
  }
}
