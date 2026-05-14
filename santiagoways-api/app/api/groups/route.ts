import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@lib/prisma';
import { getAuth, getOptionalAuth } from '@lib/auth';
import { created, handleApiError, ok, paginationParams } from '@lib/http';
import { checkRate, RATE_WRITE } from '@lib/rateLimit';

export const dynamic = 'force-dynamic';

const CreateSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(2000).optional(),
  routeId: z.string(),
  year: z.number().int().min(2000).max(2100),
  isPublic: z.boolean().default(true),
  coverImage: z.string().url().optional(),
});

// GET /api/groups?year=2026&routeId=...&mine=1
// - `mine=1` returns groups the caller belongs to (requires auth).
// - Without `mine`, returns public groups, optionally filtered by year/route.
export async function GET(req: NextRequest) {
  try {
    const auth = await getOptionalAuth(req);
    const url = new URL(req.url);
    const { cursor, limit } = paginationParams(url.searchParams);
    const year = url.searchParams.get('year');
    const routeId = url.searchParams.get('routeId') ?? undefined;
    const mine = url.searchParams.get('mine') === '1';

    if (mine && !auth) {
      return ok({ items: [], nextCursor: null });
    }

    const where = mine
      ? { members: { some: { userId: auth!.sub } } }
      : { isPublic: true, ...(year ? { year: Number(year) } : {}), ...(routeId ? { routeId } : {}) };

    const groups = await prisma.pilgrimageGroup.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
      include: {
        route: { select: { slug: true, name: true, color: true } },
        _count: { select: { members: true } },
      },
    });

    const hasMore = groups.length > limit;
    const items = groups.slice(0, limit);
    return ok({
      items,
      nextCursor: hasMore ? items[items.length - 1]!.id : null,
    });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    const limited = await checkRate(req, `group-create:${auth.sub}`, RATE_WRITE);
    if (limited) return limited;
    const body = CreateSchema.parse(await req.json());

    const route = await prisma.route.findUnique({ where: { id: body.routeId } });
    if (!route) return handleApiError(new Error('Route not found'));

    const group = await prisma.pilgrimageGroup.create({
      data: {
        name: body.name,
        description: body.description,
        routeId: body.routeId,
        year: body.year,
        ownerId: auth.sub,
        isPublic: body.isPublic,
        coverImage: body.coverImage,
        members: {
          create: { userId: auth.sub, role: 'owner' },
        },
      },
      include: {
        route: { select: { slug: true, name: true, color: true } },
        _count: { select: { members: true } },
      },
    });
    return created(group);
  } catch (e) {
    return handleApiError(e);
  }
}
