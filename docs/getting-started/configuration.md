# ⚙️ Configuration Guide

This guide covers all configuration options for NEXUS-CORE, including environment variables, feature flags, and system settings.

## 🔐 Environment Variables

### Backend Environment Variables

Create a `.env` file in the `backend/` directory with these variables:

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Service role key (full access) | `eyJhbGc...` |
| `SUPABASE_ANON_KEY` | Anonymous key (public access) | `eyJhbGc...` |

#### API Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `API_PORT` | Port for the backend server | `8000` |
| `API_HOST` | Host binding for the server | `0.0.0.0` |
| `ENVIRONMENT` | Environment mode | `development` |

#### Security Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET_KEY` | Secret key for JWT tokens | Auto-generated |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `JWT_EXPIRATION_HOURS` | Token expiration time | `24` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173` |

#### Optional Services

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_URL` | Redis connection URL for caching | `redis://localhost:6379` |
| `OPENAI_API_KEY` | OpenAI API key for AI features | None |
| `SENTRY_DSN` | Sentry DSN for error tracking | None |

#### Performance Tuning

| Variable | Description | Default |
|----------|-------------|---------|
| `RATE_LIMIT_REQUESTS` | Max requests per period | `100` |
| `RATE_LIMIT_PERIOD` | Rate limit period (seconds) | `60` |
| `LOG_LEVEL` | Logging level | `INFO` |
| `LOG_FORMAT` | Log format (json/plain) | `json` |

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |
| `VITE_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |

#### Application Settings

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_APP_ENV` | Application environment | `development` |
| `VITE_APP_VERSION` | Application version | `3.1.0` |
| `VITE_APP_NAME` | Application name | `NEXUS-CORE` |

#### Feature Flags

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_ENABLE_MCP` | Enable MCP integration | `true` |
| `VITE_ENABLE_AI_AGENTS` | Enable AI agent features | `true` |
| `VITE_ENABLE_ANALYTICS` | Enable analytics tracking | `false` |

## 🎛️ Configuration Files

### Backend Configuration

#### `backend/routers.json`

Controls which API modules are loaded:

```json
{
  "routers": {
    "client_management": {
      "name": "client_management",
      "disableAuth": false,
      "description": "Client operations"
    },
    "mcpnew": {
      "name": "mcpnew",
      "disableAuth": true,
      "description": "MCP integration"
    }
  }
}
```

#### `backend/pyproject.toml`

Python project configuration and dependencies:

```toml
[project]
name = "nexus-core-backend"
version = "2.0.0"
requires-python = ">=3.12"

[tool.black]
line-length = 100
target-version = ['py312']

[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-v --tb=short"
```

### Frontend Configuration

#### `frontend/vite.config.ts`

Vite build configuration:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/*']
        }
      }
    }
  }
})
```

#### `frontend/tsconfig.json`

TypeScript configuration:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

## 🚀 Environment-Specific Configurations

### Development Environment

```bash
# backend/.env.development
ENVIRONMENT=development
LOG_LEVEL=DEBUG
LOG_FORMAT=plain
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Staging Environment

```bash
# backend/.env.staging
ENVIRONMENT=staging
LOG_LEVEL=INFO
LOG_FORMAT=json
CORS_ALLOWED_ORIGINS=https://staging.ngxperformance.com
```

### Production Environment

```bash
# backend/.env.production
ENVIRONMENT=production
LOG_LEVEL=WARNING
LOG_FORMAT=json
CORS_ALLOWED_ORIGINS=https://app.ngxperformance.com
RATE_LIMIT_REQUESTS=1000
```

## 🔧 Advanced Configuration

### Database Connection Pooling

For production environments with high load:

```env
# Database pooling configuration
DB_POOL_SIZE=20
DB_POOL_MAX_OVERFLOW=40
DB_POOL_TIMEOUT=30
```

### Redis Configuration

For caching and session management:

```env
# Redis configuration
REDIS_URL=redis://localhost:6379/0
REDIS_MAX_CONNECTIONS=50
REDIS_DECODE_RESPONSES=true
```

### Monitoring and Observability

```env
# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_URL=http://localhost:3000
ENABLE_METRICS=true
ENABLE_TRACING=true
```

## 🔒 Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong, unique keys** for JWT_SECRET_KEY
3. **Rotate keys regularly** in production
4. **Limit CORS origins** to specific domains
5. **Use environment-specific** service keys

### Generating Secure Keys

```bash
# Generate a secure JWT secret key
openssl rand -hex 32

# Generate a secure API key
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## 📝 Configuration Validation

The application validates configuration on startup:

```python
# Backend validation
- Checks for required environment variables
- Validates Supabase connection
- Verifies CORS origins format
- Tests Redis connection (if configured)

# Frontend validation
- Ensures all VITE_ variables are set
- Validates API URL format
- Checks Supabase configuration
```

## 🆘 Troubleshooting Configuration Issues

### Missing Environment Variables

```bash
# Check which variables are loaded
cd backend
python -c "import os; print({k:v for k,v in os.environ.items() if 'SUPABASE' in k})"
```

### Invalid Configuration

Common issues and solutions:

| Issue | Solution |
|-------|----------|
| "Invalid CORS origin" | Ensure origins start with http:// or https:// |
| "Cannot connect to Supabase" | Verify URL and keys are correct |
| "JWT validation failed" | Check JWT_SECRET_KEY matches across services |
| "Rate limit exceeded" | Increase RATE_LIMIT_REQUESTS value |

## 📚 Next Steps

- [Quick Start Tutorial](quick-start.md)
- [Architecture Overview](../architecture/overview.md)
- [Deployment Guide](../deployment/docker.md)

---

<div align="center">
  <strong>Configuration Help:</strong> support@ngxperformance.com
</div>