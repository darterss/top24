#!/bin/sh
set -e

echo "Waiting for database to be ready..."
RETRIES=20
SLEEP=3
COUNT=0
until npx prisma db push 2>&1 | tee /tmp/prisma_db_push.log | tail -n +1 >/dev/null; do
  COUNT=$((COUNT+1))
  if [ "$COUNT" -ge "$RETRIES" ]; then
    echo "Prisma db push failed after $RETRIES attempts"
    exit 1
  fi
  echo "Prisma not ready yet (attempt $COUNT/$RETRIES). Retrying in ${SLEEP}s..."
  sleep $SLEEP
done

echo "Database is ready. Starting app..."
echo "Attempting migrate deploy as safety net..."
npx prisma migrate deploy || echo "migrate deploy skipped/failed (ok for dev)"
echo "Building backend (to refresh dist from mounted TS sources)..."
npm run build
exec node dist/main.js


