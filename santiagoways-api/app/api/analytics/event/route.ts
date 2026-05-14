import { NextRequest } from 'next/server';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '@lib/prisma';
import { getOptionalAuth } from '@lib/auth';
import { handleApiError, ok } from '@lib/http';
import { checkRate, RATE_ANALYTICS } from '@lib/rateLimit';

const EventSchema = z.object({
  name: z.string().min(1).max(80),
  props: z.record(z.unknown()).optional(),
  ts: z.string().datetime().optional(),
});

const BatchSchema = z.object({
  events: z.array(EventSchema).min(1).max(50),
});

// Lightweight analytics ingest. Stores events with optional user binding.
// Analytics events are best-effort: we never fail the request even if the
// payload is invalid — we drop and respond 200 to avoid client retries.
export async function POST(req: NextRequest) {
  try {
    const limited = await checkRate(req, 'analytics-event', RATE_ANALYTICS);
    if (limited) return limited;
    const auth = await getOptionalAuth(req);
    const json = await req.json().catch(() => ({}));
    const parsed = BatchSchema.safeParse(json);
    if (!parsed.success) return ok({ accepted: 0 });
    const data: Prisma.AnalyticsEventCreateManyInput[] = parsed.data.events.map((e) => ({
      userId: auth?.sub ?? null,
      name: e.name,
      props: (e.props ?? undefined) as Prisma.InputJsonValue | undefined,
      ts: e.ts ? new Date(e.ts) : undefined,
    }));
    const result = await prisma.analyticsEvent.createMany({ data });
    return ok({ accepted: result.count });
  } catch (e) {
    return handleApiError(e);
  }
}
