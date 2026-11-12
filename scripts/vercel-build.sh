#!/usr/bin/env bash
# Vercel build: migrations need a direct (non-pooled) connection. Vercel's Neon
# integration provides DATABASE_URL_UNPOOLED, so use it when DIRECT_DATABASE_URL is unset.
set -euo pipefail
export DIRECT_DATABASE_URL="${DIRECT_DATABASE_URL:-${DATABASE_URL_UNPOOLED:-$DATABASE_URL}}"
for v in DATABASE_URL AUTH_SECRET IP_HASH_SALT; do
  if [ -z "${!v:-}" ]; then echo "Missing required environment variable: $v" >&2; exit 1; fi
done
npx prisma generate
npx prisma migrate deploy
npx tsx prisma/seed.ts
npx next build
