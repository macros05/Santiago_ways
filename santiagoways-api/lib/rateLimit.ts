import { NextRequest } from 'next/server';
import { err } from './http';

// Lightweight in-memory token bucket. Sufficient for single-instance deploys
// (Render free tier, Fly single-machine) and abuse mitigation. For multi-region
// or horizontal scale, swap this implementation for Redis/Upstash without
// changing the call sites.

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
  // Maximum number of allowed requests within `windowMs`.
  limit: number;
  // Sliding window length in milliseconds.
  windowMs: number;
};

/** Returns null when allowed, or a NextResponse 429 when blocked. */
export function checkRate(req: NextRequest, suffix: string, opts: RateLimitOpts) {
  const now = Date.now();
  sweep(now);
  const key = clientKey(req, suffix);
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return null;
  }
  if (existing.count >= opts.limit) {
    const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    const res = err(
      'Too many requests, please slow down.',
      429,
      'rate_limited',
      { retryAfter },
    );
    res.headers.set('Retry-After', String(retryAfter));
    return res;
  }
  existing.count += 1;
  return null;
}

export const RATE_AUTH = { limit: 8, windowMs: 60_000 } as const;
export const RATE_REGISTER = { limit: 5, windowMs: 60_000 } as const;
export const RATE_WRITE = { limit: 30, windowMs: 60_000 } as const;
export const RATE_SEARCH = { limit: 60, windowMs: 60_000 } as const;
