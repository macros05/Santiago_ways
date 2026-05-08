import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@lib/prisma';
import { getAuth, getOptionalAuth } from '@lib/auth';
import { canPostCommunity } from '@lib/permissions';
import { created, err, handleApiError, ok, paginationParams } from '@lib/http';
import { checkRate, RATE_WRITE } from '@lib/rateLimit';
import { isOwnCloudinaryUrl } from '@lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await getOptionalAuth(req);
    const { cursor, limit } = paginationParams(req.nextUrl.searchParams);

    const posts = await prisma.post.findMany({
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true, nationality: true } },
        _count: { select: { likes: true, comments: true } },
        likes: auth ? { where: { userId: auth.sub }, select: { userId: true } } : false,
        bookmarks: auth ? { where: { userId: auth.sub }, select: { userId: true } } : false,
      },
    });

    const hasMore = posts.length > limit;
    const items = posts.slice(0, limit).map((p) => ({
      ...p,
      likedByMe: 'likes' in p ? p.likes.length > 0 : false,
      bookmarkedByMe: 'bookmarks' in p ? p.bookmarks.length > 0 : false,
    }));

    return ok({
      items,
      nextCursor: hasMore ? items[items.length - 1]!.id : null,
    });
  } catch (e) {
    return handleApiError(e);
  }
}

const createSchema = z.object({
  content: z.string().min(1).max(500),
  images: z.array(z.string().url()).max(5).default([]),
  lat: z.number().optional(),
  lng: z.number().optional(),
  locationName: z.string().max(120).optional(),
  stageId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    const limited = await checkRate(req, `post:${auth.sub}`, RATE_WRITE);
    if (limited) return limited;
    const user = await prisma.user.findUnique({
      where: { id: auth.sub },
      include: { subscription: true },
    });
    if (!canPostCommunity(user)) {
      return err(
        'Necesitas el plan Buen Camino para publicar',
        403,
        'PLAN_REQUIRED',
        { requiredPlan: 'buen_camino' },
      );
    }
    const body = createSchema.parse(await req.json());
    for (const url of body.images) {
      if (!isOwnCloudinaryUrl(url)) {
        return err('post images must be uploaded via /uploads/sign', 422, 'invalid_image_url');
      }
    }
    const post = await prisma.post.create({
      data: { ...body, userId: auth.sub },
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true } },
      },
    });
    return created(post);
  } catch (e) {
    return handleApiError(e);
  }
}
