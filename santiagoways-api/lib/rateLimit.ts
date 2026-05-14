import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { err } from './http';

// Two-tier rate limiter:
//   1. If UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set, requests
//      are counted in Upstash so multiple serverless instances share state.
//   2. Otherwise we fall back to a per-process token bucket (good enough for
//      single-instance dev / preview).
//
// Production deployments MUST configure Upstash — otherwise an attacker can
// rotate across cold serverless instances and never hit the limit.

let _redis: Redis | null = null;
function redis(): Redis | null {
  if (_redis) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  _redis = new Redis({ url, token });
  return _redis;
}

export function isDistributedRateLimiterEnabled(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

// ── Memory bucket (fallback) ───────────────────────────────────────────────
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
}

export function clientKey(req: NextRequest, suffix: string): string {
  const fwd = req.headers.get('x-forwarded-for');
  const ip = (fwd ? fwd.split(',')[0]!.trim() : req.headers.get('x-real-ip') ?? 'unknown') || 'unknown';
  return `${ip}:${suffix}`;
}

export type RateLimitOpts = {
  /** Maximum number of allowed requests within `windowMs`. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
};

function tooManyResponse(retryAfterSeconds: number) {
  const res = err(
    'Too many requests, please slow down.',
    429,
    'rate_limited',
    { retryAfter: retryAfterSeconds },
  );
  res.headers.set('Retry-After', String(retryAfterSeconds));
  return res;
}

/**
 * Returns null when allowed, or a NextResponse 429 when blocked.
 *
 * Note: this is async only because Upstash uses HTTP. The in-memory fallback
 * resolves synchronously — but call sites should always `await` so the
 * implementation can switch without breaking them.
 */
export async function checkRate(
  req: NextRequest,
  suffix: string,
  opts: RateLimitOpts,
) {
  const key = clientKey(req, suffix);
  const r = redis();

  if (r) {
    try {
      const windowSec = Math.max(1, Math.ceil(opts.windowMs / 1000));
      // INCR + EXPIRE if first hit. Atomic enough for our needs without Lua.
      const count = await r.incr(`rl:${key}`);
      if (count === 1) {
        await r.expire(`rl:${key}`, windowSec);
      }
      if (count > opts.limit) {
        const ttl = await r.ttl(`rl:${key}`);
        return tooManyResponse(Math.max(1, ttl));
      }
      return null;
    } catch (e) {
      // Network blip on Upstash — fall back to in-memory rather than failing
      // open with no limit at all.
      console.error('[rateLimit] redis failed, falling back to memory', e);
    }
  }

  const now = Date.now();
  sweep(now);
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return null;
  }
  if (existing.count >= opts.limit) {
    return tooManyResponse(Math.max(1, Math.ceil((existing.resetAt - now) / 1000)));
  }
  existing.count += 1;
  return null;
}

export const RATE_AUTH = { limit: 8, windowMs: 60_000 } as const;
export const RATE_REGISTER = { limit: 5, windowMs: 60_000 } as const;
export const RATE_WRITE = { limit: 30, windowMs: 60_000 } as const;
export const RATE_SEARCH = { limit: 60, windowMs: 60_000 } as const;
// GPS batches arrive every ~30s with up to 500 points each. Cap at 6 batches
// per minute per IP — plenty for legitimate clients, blocks flood.
export const RATE_GPS = { limit: 6, windowMs: 60_000 } as const;
// Analytics events are best-effort; cap at 12 batches/min per IP.
export const RATE_ANALYTICS = { limit: 12, windowMs: 60_000 } as const;
