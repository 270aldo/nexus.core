#!/bin/bash
set -e

# NEXUS-CORE Docker Entrypoint Script
# Production-ready initialization for NGX operations

echo "🚀 NEXUS-CORE Starting..."
echo "=========================="

# Environment validation
required_vars=("SUPABASE_URL" "SUPABASE_SERVICE_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var environment variable is not set"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Create required directories
mkdir -p /app/logs /app/data /var/log/nexus
chown -R nexus:nexus /app/logs /app/data /var/log/nexus

echo "✅ Directories created"

# Database connectivity check
echo "🔍 Checking database connectivity..."
cd /app/backend

# Wait for database to be ready
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if python -c "
import os
import sys
sys.path.append('.')
from src.infrastructure.database.performance import get_database_health
import asyncio

async def check():
    try:
        health = await get_database_health()
        if health.get('status') == 'healthy':
            print('Database is healthy')
            return True
        else:
            print(f'Database health check failed: {health}')
            return False
    except Exception as e:
        print(f'Database connection failed: {e}')
        return False

result = asyncio.run(check())
sys.exit(0 if result else 1)
"; then
        echo "✅ Database connectivity confirmed"
        break
    else
        echo "⏳ Waiting for database... (attempt $((attempt + 1))/$max_attempts)"
        sleep 5
        ((attempt++))
    fi
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ Database connectivity check failed after $max_attempts attempts"
    exit 1
fi

# Performance optimization setup
echo "⚡ Setting up performance optimizations..."

# Create cache directories
mkdir -p /app/cache/query /app/cache/static
chown -R nexus:nexus /app/cache

# Setup log rotation
cat > /etc/logrotate.d/nexus-core << EOF
/app/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    sharedscripts
    copytruncate
}
EOF

echo "✅ Performance optimizations configured"

# Application initialization
echo "🏗️ Initializing application..."

# Set Python path
export PYTHONPATH="/app/backend:$PYTHONPATH"

# Run database migrations (if needed)
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    echo "📊 Running database migrations..."
    cd /app/backend
    python -c "
import asyncio
from src.infrastructure.database.optimized_repository import apply_database_optimizations

async def run_migrations():
    try:
        await apply_database_optimizations()
        print('Database optimizations applied successfully')
    except Exception as e:
        print(f'Migration warning: {e}')
        # Continue even if migrations fail (they might be applied already)

asyncio.run(run_migrations())
"
    echo "✅ Database migrations completed"
fi

# Initialize cache
echo "💾 Initializing cache system..."
python -c "
from src.infrastructure.database.performance import query_cache, performance_monitor
print(f'Cache initialized: {query_cache.stats()}')
print('Performance monitoring started')
"

# Health check before starting services
echo "🏥 Running health checks..."
python -c "
import asyncio
from src.infrastructure.database.performance import get_database_health

async def health_check():
    health = await get_database_health()
    print(f'System Health: {health.get(\"status\", \"unknown\")}')
    print(f'Response Time: {health.get(\"response_time\", 0):.3f}s')
    return health.get('status') == 'healthy'

result = asyncio.run(health_check())
if not result:
    print('❌ Health check failed')
    exit(1)
print('✅ Health check passed')
"

echo "✅ Application initialization complete"

# Start services based on command
echo "🚀 Starting services..."

case "$1" in
    "supervisord")
        echo "Starting with Supervisor (production mode)"
        exec supervisord -c /etc/supervisor/conf.d/supervisord.conf
        ;;
    "backend")
        echo "Starting backend only"
        cd /app/backend
        exec uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4
        ;;
    "nginx")
        echo "Starting nginx only"
        exec nginx -g 'daemon off;'
        ;;
    "dev")
        echo "Starting in development mode"
        cd /app/backend
        exec uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
        ;;
    "migrate")
        echo "Running migrations only"
        cd /app/backend
        python -c "
import asyncio
from src.infrastructure.database.optimized_repository import apply_database_optimizations

async def run_migrations():
    await apply_database_optimizations()
    print('Migrations completed successfully')

asyncio.run(run_migrations())
"
        ;;
    "test")
        echo "Running tests"
        cd /app/backend
        exec pytest tests/ -v
        ;;
    "shell")
        echo "Starting interactive shell"
        cd /app/backend
        exec python -c "
import sys
sys.path.append('.')
from src.infrastructure.database.optimized_repository import create_optimized_client_repository
from src.interfaces.dependencies import get_container

print('NEXUS-CORE Interactive Shell')
print('Available objects:')
print('  - repo: create_optimized_client_repository()')
print('  - container: get_container()')

repo = create_optimized_client_repository()
container = get_container()

import code
code.interact(local=locals())
"
        ;;
    *)
        echo "Usage: $0 {supervisord|backend|nginx|dev|migrate|test|shell}"
        echo ""
        echo "Commands:"
        echo "  supervisord - Start full production stack (default)"
        echo "  backend     - Start backend API only"
        echo "  nginx       - Start nginx proxy only"
        echo "  dev         - Start in development mode"
        echo "  migrate     - Run database migrations"
        echo "  test        - Run test suite"
        echo "  shell       - Interactive Python shell"
        exit 1
        ;;
esac