// Single source of truth for which env vars are required at boot, evaluated
// once and exported as a checklist used by /api/health and the webhook route.

type Status = { ok: boolean; missing: string[]; warnings: string[] };

let cached: Status | null = null;

function notSet(name: string): boolean {
  const v = process.env[name];
  return !v || v.length === 0;
}

export function checkEnv(): Status {
  if (cached) return cached;

  const missing: string[] = [];
  const warnings: string[] = [];

  // Always required, regardless of environment.
  for (const k of [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ]) {
    if (notSet(k)) missing.push(k);
  }

  // Production-only requirements. Some integrations are optional in dev but
  // bricked in prod (subscriptions, OAuth, email).
  if (process.env.NODE_ENV === 'production') {
    for (const k of [
      'REVENUECAT_WEBHOOK_SECRET',
      'GOOGLE_CLIENT_ID',
      'APP_PUBLIC_URL',
    ]) {
      if (notSet(k)) missing.push(k);
    }

    for (const k of [
      'APPLE_CLIENT_ID',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
      'RESEND_API_KEY',
      'EMAIL_FROM',
      'PUSHER_APP_ID',
      'PUSHER_KEY',
      'PUSHER_SECRET',
      'PUSHER_CLUSTER',
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN',
    ]) {
      // Soft warning instead of hard failure — these gate specific features
      // (Apple Sign In, image uploads, password reset email, live map,
      // distributed rate limiting). The app boots without them; the affected
      // feature returns a 5xx/503 explaining the missing config.
      if (notSet(k)) warnings.push(k);
    }
  }

  cached = { ok: missing.length === 0, missing, warnings };
  return cached;
}

/**
 * Throws on the first request if a hard requirement is missing in production.
 * Call this from any startup-critical route (health, webhook, etc.) to fail
 * loudly rather than silently misbehaving.
 */
export function assertProductionEnv(): void {
  const status = checkEnv();
  if (!status.ok && process.env.NODE_ENV === 'production') {
    throw new Error(
      `Refusing to serve: missing required env vars: ${status.missing.join(', ')}`,
    );
  }
}
