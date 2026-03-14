#!/bin/bash
set -e

echo "Running Prisma migrate deploy..."
node ./node_modules/prisma/build/index.js migrate deploy

echo "Starting Next.js server..."
node server.js
