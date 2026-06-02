# syntax=docker/dockerfile:1
# SantiagoWays API — Next.js 15 (App Router) + Prisma/Postgres.
# Self-contained image: it does NOT rely on the monorepo workspace; it installs
# the API's own dependencies standalone so it can be built and deployed alone.

FROM node:20-bookworm-slim AS base
ENV NODE_ENV=production
# openssl is required by Prisma at runtime; ca-certificates for outbound HTTPS.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# ---- build stage ----
FROM base AS builder
WORKDIR /app
# Build tools for native deps (argon2).
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*
COPY package.json ./
# No standalone lockfile exists in the monorepo, so resolve this service's deps.
RUN npm install --no-audit --no-fund
COPY . .
# This service's tsconfig extends "expo/tsconfig.base" — a monorepo hoist that
# is NOT installed in this standalone image. Drop the extends; the API's own
# compilerOptions (baseUrl + the @lib/* path aliases) are self-sufficient for Next.
RUN node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync('tsconfig.json','utf8'));delete j.extends;fs.writeFileSync('tsconfig.json',JSON.stringify(j,null,2));"
# Generate the Prisma client and build Next. Neither step needs a live DB.
RUN npx prisma generate && npm run build

# ---- runtime stage ----
FROM base AS runner
WORKDIR /app
ENV PORT=3000
# Full dependency tree (incl. the prisma CLI + tsx for migrate/seed) and build.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/prisma ./prisma
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
EXPOSE 3000
# Drop privileges: run the server as the built-in non-root `node` user instead
# of root. The copied files are world-readable and the app writes nothing under
# /app at runtime (Next is prebuilt, Prisma client generated at build), so no
# chown is needed; binding :3000 (>1024) works unprivileged.
USER node
# Entrypoint applies pending migrations, then runs the CMD (next start).
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
