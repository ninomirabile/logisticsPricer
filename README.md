# LogisticsPricer

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/your-username/logisticspricer)
[![License](https://img.shields.io/badge/license-CC--BY--NC--4.0-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D6.0-brightgreen.svg)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/docker-required-blue.svg)](https://www.docker.com/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-brightgreen.svg)](.github/workflows/ci-cd.yml)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](backend/tests/)
[![Coverage](https://img.shields.io/badge/coverage-%3E70%25-brightgreen.svg)](backend/tests/)
[![Deploy](https://img.shields.io/badge/deploy-Docker%20%7C%20K8s-blue.svg)](deploy.sh)
[![Status](https://img.shields.io/badge/status-production%20ready-brightgreen.svg)](docs/README.md)

A professional web application for freight transport cost calculation using the MERN stack (MongoDB, Express.js, React, Node.js).

**Author**: Antonino Mirabile  
**License**: [CC-BY-NC-4.0](LICENSE) (Non-commercial use)

## 🚀 Overview

LogisticsPricer provides accurate shipping estimates based on specific logistics parameters, with a modern and responsive interface.

### Key Features
- ✅ Real-time transport cost calculation
- ✅ Modern and responsive user interface
- ✅ Calculation history and analytics
- ✅ Scalable RESTful API
- ✅ Robust input/output validation
- ✅ Optimized performance
- ✅ Community-driven development
- **🆕 Centralized URL Management System**
- **🆕 Multi-Environment Support (Dev/Staging/Prod)**
- **🆕 Enterprise CI/CD Pipeline**
- **🆕 Custom Domain Support**
- **🆕 Zero-Downtime Deployments**

## 🏗️ Architecture

### Technology Stack
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: MongoDB + Mongoose ODM
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query + Zustand
- **Forms**: React Hook Form + Zod
- **Testing**: Jest + Vitest + React Testing Library
- **🆕 Infrastructure**: Docker + Kubernetes + GitHub Actions
- **🆕 Reverse Proxy**: Nginx with SSL support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Git
- Docker (optional, for containerized deployment)

### Quick Setup

#### 🎯 Simple Method (Recommended)
```bash
# Clone repository
git clone <repository-url>
cd logisticspricer

# Start the entire application with one command
./start.sh

# To stop everything
./stop.sh
```

#### 🔧 Manual Method
```bash
# Clone repository
git clone <repository-url>
cd logisticspricer

# Setup backend
cd backend
npm install
npm run dev

# Setup frontend (new terminal)
cd frontend
npm install
npm run dev
```

#### 🆕 Production Deployment
```bash
# Setup custom domain
./scripts/setup-domains.sh -e production -d yourdomain.com -a api.yourdomain.com

# Deploy with Docker Compose
docker-compose up -d

# Or deploy with Kubernetes
./deploy.sh production
```

### Useful Commands

#### Management Scripts
```bash
./start.sh          # Start the entire application
./stop.sh           # Stop all services
./stop.sh status    # Show service status
./stop.sh force     # Force stop all services
./deploy.sh         # Deploy to production
```

#### 🆕 Domain Management
```bash
# Development environment
./scripts/setup-domains.sh -e development

# Staging environment
./scripts/setup-domains.sh -e staging -d staging.yourdomain.com -a api-staging.yourdomain.com

# Production environment
./scripts/setup-domains.sh -e production -d yourdomain.com -a api.yourdomain.com
```

#### Logs and Monitoring
```bash
# View real-time logs
tail -f logs/backend.log    # Backend logs
tail -f logs/frontend.log   # Frontend logs

# Check service status
./stop.sh status

# 🆕 Check deployment status
docker-compose ps
kubectl get pods -n logisticspricer
```

## 📊 Performance Goals

- **API Response Time**: <500ms
- **Frontend Load Time**: <5s
- **Bundle Size**: <1MB gzipped
- **Lighthouse Score**: >80
- **Test Coverage**: >70%
- **🆕 Zero-Downtime Deployments**: 100% uptime
- **🆕 Multi-Environment Sync**: <30s propagation

## 🆕 Enterprise Features

### Centralized URL Management
- **Single Configuration Point**: Change domains in one place
- **Multi-Environment Support**: Dev, staging, production
- **Automatic Propagation**: Updates across all services
- **Custom Domain Support**: White-label solutions

### CI/CD Pipeline
- **Automated Testing**: Unit, integration, security
- **Docker Builds**: Optimized multi-stage builds
- **Kubernetes Deployment**: Scalable container orchestration
- **Security Scanning**: Vulnerability detection
- **Rollback Capability**: Quick recovery from issues

### Infrastructure
- **Load Balancing**: Nginx reverse proxy
- **SSL/TLS**: Automatic certificate management
- **Health Checks**: Proactive monitoring
- **Auto-scaling**: Kubernetes HPA
- **Backup & Recovery**: Automated data protection

## 🤝 Contributing

This project follows GitHub community best practices:

### Quality Gates (Relaxed for Community)
- ✅ Test coverage >70%
- ✅ Linting with max 10 warnings
- ✅ Performance response time <500ms
- ✅ Bundle size <1MB
- ✅ Security audit (max 5 low-severity vulnerabilities)
- **🆕 CI/CD pipeline success**
- **🆕 Multi-environment compatibility**

### Contribution Process
1. Fork the repository
2. Create feature branch
3. Implement changes
4. Test and validate
5. Pull request with template
6. Review and merge
7. **🆕 Automated deployment to staging**

## 📄 License

This project is released under the [Creative Commons Attribution-NonCommercial 4.0 International](LICENSE) license.

### What you can do:
- ✅ Share and distribute the material
- ✅ Adapt and modify the code
- ✅ Use for educational and personal purposes

### What you CANNOT do:
- ❌ Use for commercial purposes
- ❌ Omit attribution to the author
- ❌ Apply additional restrictions

## 👨‍💻 Author

**Antonino Mirabile** - Full-stack developer with experience in modern technologies and software development best practices.

## 🤖 AI Development Support

This project was developed with AI support to optimize the development process and ensure code quality. AI was used for:

- Boilerplate code generation
- Performance optimization
- Best practices implementation
- Testing and quality assurance
- Technical documentation
- **🆕 Infrastructure automation**
- **🆕 CI/CD pipeline design**

## 📚 Documentation

### 📖 [Complete Documentation](docs/README.md)

Our comprehensive documentation is organized in the `docs/` directory:

#### 🚀 Getting Started
- **[Environment Setup](docs/environment-setup.md)** - Complete setup guide for all environments
- **[Domain Configuration](docs/domain-setup.md)** - Custom domain setup and management

#### 🏗️ Development & Architecture
- **[CI/CD Pipeline](docs/ci-cd-pipeline.md)** - Deployment automation and pipeline details
- **[API Documentation](docs/api-docs.md)** - Backend API reference (coming soon)
- **[Frontend Guide](docs/frontend-guide.md)** - React development guide (coming soon)

#### 💼 Business & Market
- **[Market Analysis](docs/market-analysis.md)** - Business analysis and market positioning

#### 🛠️ Operations & Monitoring
- **[Troubleshooting](docs/troubleshooting.md)** - Common issues and solutions

### Quick Navigation
- **For Developers**: Start with [Environment Setup](docs/environment-setup.md)
- **For DevOps**: Check [CI/CD Pipeline](docs/ci-cd-pipeline.md)
- **For Business**: Review [Market Analysis](docs/market-analysis.md)

---

**Note**: This project is open source and accepts contributions from the community. For more details on how to contribute, consult the project guidelines.