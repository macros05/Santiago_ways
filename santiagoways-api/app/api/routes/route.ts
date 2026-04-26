import { prisma } from '@lib/prisma';
import { handleApiError, ok } from '@lib/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const routes = await prisma.route.findMany({
      orderBy: { isPopular: 'desc' },
      include: { _count: { select: { stages: true } } },
    });
    return ok(routes);
  } catch (e) {
    return handleApiError(e);
  }
}
