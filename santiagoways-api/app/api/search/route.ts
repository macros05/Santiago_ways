import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { handleApiError, ok } from '@lib/http';
import { checkRate, RATE_SEARCH } from '@lib/rateLimit';

export async function GET(req: NextRequest) {
  try {
    const limited = checkRate(req, 'search', RATE_SEARCH);
    if (limited) return limited;
    const q = req.nextUrl.searchParams.get('q')?.trim();
    const type = req.nextUrl.searchParams.get('type'); // stages | albergues | users | posts
    if (!q || q.length < 2 || q.length > 80) return ok({ results: [] });

    const results: Record<string, unknown[]> = {};

    if (!type || type === 'stages') {
      results.stages = await prisma.stage.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { startPoint: { contains: q, mode: 'insensitive' } },
            { endPoint: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
        select: { id: true, name: true, number: true, route: { select: { slug: true, name: true } } },
      });
    }
    if (!type || type === 'albergues') {
      results.albergues = await prisma.albergue.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { city: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
        select: { id: true, name: true, city: true, type: true },
      });
    }
    if (!type || type === 'users') {
      results.users = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: q, mode: 'insensitive' } },
            { name: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
        select: { id: true, username: true, name: true, avatar: true },
      });
    }
    if (!type || type === 'posts') {
      results.posts = await prisma.post.findMany({
        where: { content: { contains: q, mode: 'insensitive' } },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          locationName: true,
          user: { select: { username: true, name: true, avatar: true } },
        },
      });
    }

    return ok({ q, results });
  } catch (e) {
    return handleApiError(e);
  }
}
