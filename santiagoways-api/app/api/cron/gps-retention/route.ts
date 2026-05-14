import { NextRequest } from 'next/server';
import { prisma } from '@lib/prisma';
import { err, handleApiError, ok } from '@lib/http';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 90-day GPS point retention. Run daily from Vercel cron (vercel.json) or
// any external scheduler hitting `Authorization: Bearer ${CRON_SECRET}`.
// Returns the count of deleted rows so the caller can graph it.
const RETENTION_DAYS = 90;

async function run(req: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET;
    if (!secret) return err('CRON_SECRET not configured', 500, 'misconfigured');
    const header = req.headers.get('authorization');
    if (header !== `Bearer ${secret}`) return err('unauthorized', 401, 'unauthorized');

    const cutoff = new Date(Date.now() - RETENTION_DAYS * 86_400_000);
    const result = await prisma.gpsPoint.deleteMany({
      where: { recordedAt: { lt: cutoff } },
    });
    return ok({ deleted: result.count, cutoff: cutoff.toISOString() });
  } catch (e) {
    return handleApiError(e);
  }
}

export const GET = run;
export const POST = run;
