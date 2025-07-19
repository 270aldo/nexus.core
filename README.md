<div align="center">
  <img src="docs/assets/ngx-logo.png" alt="NGX Performance & Longevity" width="200" />
  
  # NEXUS-CORE
  
  ### 🚀 Enterprise Control Center for NGX Performance & Longevity
  
  [![Version](https://img.shields.io/badge/version-3.1.0-blue.svg)](https://github.com/270aldo/nexus.core)
  [![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/270aldo/nexus.core/actions)
  [![License](https://img.shields.io/badge/license-proprietary-red.svg)](LICENSE)
  [![Python](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/)
  [![React](https://img.shields.io/badge/react-18.3-61dafb.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/typescript-5.5-3178c6.svg)](https://www.typescriptlang.org/)
  
  [Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Documentation](#-documentation) • [Contributing](#-contributing)
</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [System Requirements](#-system-requirements)
- [Quick Start](#-quick-start)
- [Architecture](#-architecture)
- [Documentation](#-documentation)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Support](#-support)
- [License](#-license)

## 🎯 Overview

**NEXUS-CORE** is the centralized control platform for NGX Performance & Longevity operations. Designed for coaches, specialists, and the NGX team, it provides comprehensive client management, AI-powered analytics, and seamless integration with Claude Desktop through MCP (Model Context Protocol).

### 🌟 Key Capabilities

- **Unified Client Management**: Manage both PRIME (performance) and LONGEVITY (wellness) clients
- **AI-Powered Analytics**: 9 specialized agents providing insights and recommendations
- **Real-time Progress Tracking**: Comprehensive metrics and adherence monitoring
- **Claude Desktop Integration**: Natural language interaction with client data
- **Enterprise Architecture**: Scalable, secure, and production-ready

## ✨ Features

### 🏃‍♂️ PRIME Program Management
- Performance-focused training programs
- Advanced metrics tracking
- Competition preparation tools
- Strength and conditioning analytics

### 🧘 LONGEVITY Program Management
- Wellness-oriented programs
- Health span optimization
- Recovery and regeneration tracking
- Lifestyle integration tools

### 🤖 Hybrid Intelligence System
- **9 Specialized Agents**: NEXUS, BLAZE, SAGE, WAVE, SPARK, STELLA, NOVA, CODE, LUNA
- Real-time processing visualization
- Collaborative AI decision making
- Natural language program generation

### 📊 Advanced Analytics
- Client adherence metrics
- Program effectiveness analysis
- Business intelligence dashboards
- Predictive insights

### 🔗 Integrations
- **Claude Desktop**: Full MCP integration for conversational AI
- **Supabase**: Secure data storage with RLS
- **OpenAI**: Advanced language processing
- **Real-time sync**: Live updates across all platforms

## 💻 System Requirements

### Prerequisites
- **Node.js**: v18.0 or higher
- **Python**: v3.12 or higher
- **PostgreSQL**: v14+ (via Supabase)
- **Git**: Latest version

### Recommended
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 2GB free space
- **OS**: macOS, Linux, or Windows with WSL2

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/270aldo/nexus.core.git
cd nexus-core
```

### 2. Environment Setup
```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit the .env files with your credentials
# Required: Supabase URL and keys
```

### 3. Install Dependencies
```bash
# Install all dependencies (frontend + backend)
make install
```

### 4. Start Development Servers
```bash
# Terminal 1: Start backend (port 8000)
make run-backend

# Terminal 2: Start frontend (port 5173)
make run-frontend
```

### 5. Access the Application
- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🏗️ Architecture

### High-Level Overview
```
┌─────────────────────────────────────────────────────────────┐
│                        Claude Desktop                        │
│                    (MCP Integration Layer)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    NEXUS-CORE Frontend                       │
│          React 18 + TypeScript + NGX Design System          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    NEXUS-CORE Backend                        │
│        FastAPI + Clean Architecture + Python 3.12           │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                        Supabase                              │
│              PostgreSQL + Realtime + Auth + RLS             │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS + shadcn/ui
- **Build Tool**: Vite (optimized configuration)
- **Design System**: Custom NGX components

### Backend Architecture
- **Framework**: FastAPI with Clean Architecture
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + JWT
- **API Style**: RESTful + MCP endpoints
- **Performance**: Redis caching + query optimization

## 📚 Documentation

### Getting Started
- [📖 Installation Guide](docs/getting-started/installation.md)
- [⚙️ Configuration](docs/getting-started/configuration.md)
- [🏃 Quick Start Tutorial](docs/getting-started/quick-start.md)

### Architecture Guides
- [🏛️ System Overview](docs/architecture/overview.md)
- [🎨 Frontend Architecture](docs/architecture/frontend.md)
- [⚡ Backend Architecture](docs/architecture/backend.md)
- [🗄️ Database Schema](docs/architecture/database.md)

### Feature Documentation
- [💪 PRIME Program Guide](docs/features/prime-program.md)
- [🌱 LONGEVITY Program Guide](docs/features/longevity-program.md)
- [🤖 Hybrid Intelligence System](docs/features/hybrid-intelligence.md)

### Integration Guides
- [🤖 Claude Desktop Setup](docs/user-guides/claude-desktop.md)
- [📡 API Reference](docs/api/rest-endpoints.md)
- [🔌 MCP Integration](docs/api/mcp-integration.md)

### Deployment
- [🐳 Docker Deployment](docs/deployment/docker.md)
- [☸️ Kubernetes Guide](docs/deployment/kubernetes.md)
- [🚀 Production Checklist](docs/deployment/production.md)

## 🛠️ Development

### Development Setup
```bash
# Backend development with hot reload
cd backend
python -m uvicorn src.main:create_app --factory --reload

# Frontend development with HMR
cd frontend
npm run dev
```

### Running Tests
```bash
# Backend tests
cd backend
pytest tests/ -v --cov=src

# Frontend tests
cd frontend
npm run test
```

### Code Quality
```bash
# Backend linting and formatting
cd backend
black src/ tests/
flake8 src/ tests/
mypy src/

# Frontend linting
cd frontend
npm run lint
npm run type-check
```

### Building for Production
```bash
# Build frontend
cd frontend
npm run build

# Build Docker images
docker-compose build
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Scale services
docker-compose up -d --scale app=3
```

### Kubernetes Deployment
```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n nexus-core
```

### Environment Variables
See [Configuration Guide](docs/getting-started/configuration.md) for complete environment variable reference.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/development/contributing.md) for details.

### Development Workflow
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Commit Convention
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

## 📞 Support

### Documentation
- [📚 Full Documentation](docs/)
- [❓ FAQ](docs/faq.md)
- [🐛 Troubleshooting](docs/troubleshooting.md)

### Contact
- **Technical Issues**: [GitHub Issues](https://github.com/270aldo/nexus.core/issues)
- **Business Inquiries**: contact@ngxperformance.com
- **Support**: support@ngxperformance.com

## 📄 License

This project is proprietary software owned by NGX Performance & Longevity. All rights reserved.

---

<div align="center">
  <strong>Built with ❤️ by the NGX Development Team</strong>
  
  <sub>© 2025 NGX Performance & Longevity. All rights reserved.</sub>
</div>