# Multi-stage Dockerfile for NEXUS-CORE Production
# Optimized for NGX Performance & Longevity operations

# ================================
# Stage 1: Frontend Build
# ================================
FROM node:18-alpine AS frontend-builder

# Set working directory
WORKDIR /app/frontend

# Copy package files
COPY frontend/package-optimized.json package.json
COPY frontend/package-lock.json* ./

# Install dependencies with optimizations
RUN npm ci --only=production --silent

# Copy frontend source
COPY frontend/ .

# Build optimized frontend
RUN npm run build --config vite.config.optimized.ts

# ================================
# Stage 2: Backend Dependencies
# ================================
FROM python:3.13-slim AS backend-deps

# Set working directory
WORKDIR /app/backend

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY backend/pyproject.toml backend/uv.lock* ./

# Install uv package manager
RUN pip install uv

# Install Python dependencies
RUN uv sync --frozen

# ================================
# Stage 3: Production Runtime
# ================================
FROM python:3.13-slim AS production

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PATH="/app/backend/.venv/bin:$PATH"

# Create app user for security
RUN groupadd -r nexus && useradd -r -g nexus nexus

# Set working directory
WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Copy Python dependencies from previous stage
COPY --from=backend-deps /app/backend/.venv /app/backend/.venv

# Copy backend source
COPY backend/ /app/backend/
RUN chown -R nexus:nexus /app/backend

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist
RUN chown -R nexus:nexus /app/frontend

# Copy configuration files
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create directories for logs and data
RUN mkdir -p /var/log/nexus /app/data /app/logs && \
    chown -R nexus:nexus /var/log/nexus /app/data /app/logs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Expose ports
EXPOSE 80 8000

# Switch to non-root user
USER nexus

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Default command
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

# ================================
# Metadata
# ================================
LABEL maintainer="NGX Performance & Longevity <dev@ngxperformance.com>"
LABEL description="NEXUS-CORE: Central nervous system for NGX operations"
LABEL version="2.0.0"
LABEL architecture="Clean Architecture + Performance Optimized"