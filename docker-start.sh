#!/bin/sh
set -e

# Display environment (for debugging, redact sensitive info)
echo "Starting in NODE_ENV: $NODE_ENV"
echo "REDIS_HOST: $REDIS_HOST"
echo "Using DATABASE_URL: ${DATABASE_URL:0:15}...redacted"

# Check OpenSSL version (for Prisma SSL detection)
echo "OpenSSL version:"
openssl version || echo "OpenSSL not found"

# Generate Prisma client
echo "Generating Prisma client..."

# Set Prisma query engine binary type if not set
if [ -z "$PRISMA_QUERY_ENGINE_TYPE" ]; then
  export PRISMA_QUERY_ENGINE_TYPE=binary
  echo "Set PRISMA_QUERY_ENGINE_TYPE=binary"
fi

npx prisma generate

# Make sure dist exists
if [ ! -d "dist" ]; then
  echo "Building application..."
  npm run build
fi

# Start the application
echo "Starting application..."
node dist/main.js 