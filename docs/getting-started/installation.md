# 📖 Installation Guide

This guide will walk you through setting up NEXUS-CORE on your local development environment.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

| Software | Minimum Version | Recommended Version | Check Command |
|----------|----------------|-------------------|---------------|
| Node.js | v18.0 | v20.0+ | `node --version` |
| Python | v3.12 | v3.12+ | `python --version` |
| Git | v2.0 | Latest | `git --version` |
| Make | Any | Latest | `make --version` |

### Optional but Recommended

- **Docker**: For containerized deployment
- **PostgreSQL**: If running database locally instead of Supabase
- **Redis**: For caching (optional)

## 🛠️ Installation Steps

### 1. Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/270aldo/nexus.core.git

# Or clone via SSH (if you have SSH keys set up)
git clone git@github.com:270aldo/nexus.core.git

# Navigate to project directory
cd nexus-core
```

### 2. Set Up Python Environment

We recommend using a virtual environment for Python dependencies:

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
# venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# For development dependencies
pip install -e ".[dev]"
```

### 3. Set Up Node.js Environment

```bash
# Navigate to frontend directory
cd ../frontend

# Install Node dependencies
npm install

# If you encounter issues, try:
npm install --legacy-peer-deps
```

### 4. Configure Environment Variables

#### Backend Configuration

```bash
# Copy the example environment file
cp backend/.env.example backend/.env

# Edit backend/.env with your editor
```

Required variables for backend:
```env
# Supabase Configuration (Required)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-here
SUPABASE_ANON_KEY=your-anon-key-here

# API Configuration
API_PORT=8000
API_HOST=0.0.0.0

# Environment
ENVIRONMENT=development

# CORS (comma-separated origins)
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### Frontend Configuration

```bash
# Copy the example environment file
cp frontend/.env.example frontend/.env

# Edit frontend/.env with your editor
```

Required variables for frontend:
```env
# API Configuration
VITE_API_URL=http://localhost:8000

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Environment
VITE_APP_ENV=development
```

### 5. Set Up Supabase

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and keys to the `.env` files
4. Run the database migrations:

```bash
# From the backend directory
cd backend
python -m migrations.v001_initial_schema
```

### 6. Verify Installation

Run the following commands to verify everything is set up correctly:

```bash
# From project root
cd nexus-core

# Run backend tests
cd backend
pytest tests/unit/test_health.py -v

# Check frontend build
cd ../frontend
npm run type-check
```

## 🚀 Quick Start with Make

If you have `make` installed, you can use our convenience commands:

```bash
# From project root
# Install all dependencies
make install

# Start backend server (Terminal 1)
make run-backend

# Start frontend server (Terminal 2)
make run-frontend
```

## 🐳 Docker Installation (Alternative)

If you prefer using Docker:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔧 Troubleshooting

### Common Issues

#### Python Version Issues
```bash
# If you have multiple Python versions, specify explicitly:
python3.12 -m venv venv
```

#### Node.js Version Issues
```bash
# Use nvm to manage Node versions
nvm install 20
nvm use 20
```

#### Permission Errors
```bash
# On macOS/Linux, you might need to use sudo for global installs
sudo npm install -g npm@latest
```

#### Port Already in Use
```bash
# Find and kill process using port 8000 (backend)
lsof -ti:8000 | xargs kill -9

# Find and kill process using port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Getting Help

If you encounter issues:

1. Check the [Troubleshooting Guide](../troubleshooting.md)
2. Search existing [GitHub Issues](https://github.com/270aldo/nexus.core/issues)
3. Create a new issue with:
   - Your OS and version
   - Node.js and Python versions
   - Complete error messages
   - Steps to reproduce

## ✅ Next Steps

Once installation is complete:

1. [Configure your environment](configuration.md)
2. [Follow the Quick Start tutorial](quick-start.md)
3. [Learn about the architecture](../architecture/overview.md)
4. [Set up Claude Desktop integration](../user-guides/claude-desktop.md)

---

<div align="center">
  <strong>Need help?</strong> Contact support@ngxperformance.com
</div>