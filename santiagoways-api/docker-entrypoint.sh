#!/usr/bin/env bash
# Applies any pending Prisma migrations against DATABASE_URL, then starts the
# server. Safe to run on every boot: `migrate deploy` is idempotent and only
# applies migrations that haven't run yet.
set -euo pipefail

echo "▸ Applying database migrations (prisma migrate deploy)…"
npx prisma migrate deploy

echo "▸ Starting SantiagoWays API on :${PORT:-3000}…"
exec "$@"
