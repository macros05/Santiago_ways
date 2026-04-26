import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { handleApiError, ok } from '@lib/http';

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  bio: z.string().max(280).optional(),
  avatar: z.string().url().optional(),
  nationality: z.string().length(2).optional(),
  privateAccount: z.boolean().optional(),
  shareLocation: z.boolean().optional(),
  language: z.enum(['es', 'en']).optional(),
  pushToken: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    const body = patchSchema.parse(await req.json());
    const user = await prisma.user.update({
      where: { id: auth.sub },
      data: body,
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        avatar: true,
        nationality: true,
        privateAccount: true,
        shareLocation: true,
        language: true,
      },
    });
    return ok(user);
  } catch (e) {
    return handleApiError(e);
  }
}
