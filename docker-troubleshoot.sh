#!/bin/bash
set -e

echo "🔍 Docker Troubleshooting Script 🔍"
echo "===================================="

# Check Docker version
echo "📋 Docker version:"
docker --version
docker-compose --version
echo

# Check if Docker is running
echo "📋 Docker daemon status:"
if docker info >/dev/null 2>&1; then
  echo "✅ Docker is running"
else
  echo "❌ Docker is not running"
  echo "   Please start Docker and try again"
  exit 1
fi
echo

# Check if our images exist
echo "📋 Docker images:"
if docker images | grep finart-server >/dev/null; then
  echo "✅ finart-server image exists"
else
  echo "❌ finart-server image not found"
  echo "   Run 'npm run docker:build' to create it"
fi
echo

# Check if our containers are running
echo "📋 Docker containers:"
if docker ps | grep finart-app >/dev/null; then
  echo "✅ finart-app container is running"
else
  echo "❌ finart-app container is not running"
  
  # Check if container exists but is not running
  if docker ps -a | grep finart-app >/dev/null; then
    echo "   Container exists but is not running"
    echo "   Check logs with 'docker logs finart-app'"
  fi
fi
echo

# Display logs if container exists
echo "📋 Container logs (if any):"
if docker ps -a | grep finart-app >/dev/null; then
  docker logs --tail 20 finart-app
else
  echo "No logs available (container doesn't exist)"
fi
echo

# Environment check
echo "📋 Environment variables:"
echo "NODE_ENV: $NODE_ENV"
echo "DATABASE_URL: ${DATABASE_URL:+configured}"
echo "REDIS_HOST: $REDIS_HOST"
echo "DISABLE_PRISMA: $DISABLE_PRISMA"
echo

echo "===================================="
echo "💡 Suggestions:"
echo "1. Make sure Docker is running"
echo "2. Ensure .env file has required variables"
echo "3. Build with 'npm run docker:build'"
echo "4. Start with 'npm run docker:prod' (production) or 'npm run docker:dev' (development)"
echo "5. Check logs with 'docker logs finart-app'"
echo "====================================" 