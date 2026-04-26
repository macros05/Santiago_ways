import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { getAuth } from '@lib/auth';
import { handleApiError, ok, paginationParams } from '@lib/http';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    const { cursor, limit } = paginationParams(req.nextUrl.searchParams);
    const items = await prisma.notification.findMany({
      where: { userId: auth.sub },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });
    const hasMore = items.length > limit;
    return ok({
      items: items.slice(0, limit),
      nextCursor: hasMore ? items[limit - 1]!.id : null,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
