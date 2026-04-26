import { ok } from '@lib/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  return ok({ status: 'ok', service: 'santiagoways-api', time: new Date().toISOString() });
}
