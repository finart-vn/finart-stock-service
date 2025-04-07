#!/bin/sh
set -e

# Display environment (for debugging, redact sensitive info)
echo "Starting in NODE_ENV: $NODE_ENV"
echo "REDIS_HOST: $REDIS_HOST"
echo "Using DATABASE_URL: ${DATABASE_URL:0:15}...redacted"

# Check OpenSSL version (for Prisma SSL detection)
echo "OpenSSL version:"
openssl version || echo "OpenSSL not found"

# Set Prisma environment variables
export PRISMA_QUERY_ENGINE_TYPE=binary
export PRISMA_CLIENT_ENGINE_TYPE=binary

# Set OpenSSL lib directory if empty (helps Prisma find OpenSSL)
if [ -z "$LD_LIBRARY_PATH" ]; then
  export LD_LIBRARY_PATH=/usr/lib
  echo "Set LD_LIBRARY_PATH=$LD_LIBRARY_PATH"
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Make sure dist exists
if [ ! -d "dist" ]; then
  echo "Building application..."
  npm run build
fi

# Start the application
echo "Starting application..."
node dist/main.js 