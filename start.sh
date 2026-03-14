#!/bin/bash
set -e

echo "Running Prisma db push..."
node ./node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss

echo "Starting Next.js server..."
node server.js
