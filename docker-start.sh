#!/bin/sh
set -e

# Display environment (for debugging, redact sensitive info)
echo "Starting in NODE_ENV: $NODE_ENV"
echo "REDIS_HOST: $REDIS_HOST"
echo "Using DATABASE_URL: ${DATABASE_URL:0:15}...redacted"

# Run Prisma generate if needed
if [ "$DISABLE_PRISMA" != "true" ]; then
  echo "Generating Prisma client..."
  npx prisma generate
fi

# Make sure dist exists
if [ ! -d "dist" ]; then
  echo "Building application..."
  npm run build
fi

# Start the application
echo "Starting application..."
node dist/main.js 