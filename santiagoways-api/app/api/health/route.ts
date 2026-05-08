import { err, ok } from '@lib/http';
import { checkEnv } from '@lib/env';
import { isDistributedRateLimiterEnabled } from '@lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET() {
  const env = checkEnv();
  const body = {
    status: env.ok ? 'ok' : 'degraded',
    service: 'santiagoways-api',
    time: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    rateLimiter: isDistributedRateLimiterEnabled() ? 'redis' : 'memory',
    missing: env.missing,
    warnings: env.warnings,
  };
  if (!env.ok) {
    // Return 503 so platform health probes (Render, Fly, Vercel) catch a
    // misconfigured deploy instead of silently routing traffic to it.
    return err('configuration incomplete', 503, 'env_missing', body);
  }
  return ok(body);
}
