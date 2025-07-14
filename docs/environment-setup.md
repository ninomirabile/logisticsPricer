# 🛠️ Environment Setup Guide

## Overview

This guide covers the complete setup of the LogisticsPricer application across different environments (development, staging, production).

## 📋 Prerequisites

### Required Software
- **Node.js** 18+ 
- **MongoDB** 6+
- **Git**
- **Docker** (optional, for containerized deployment)
- **Kubernetes** (optional, for production deployment)

### System Requirements
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 10GB free space
- **Network**: Internet connection for package installation

## 🚀 Quick Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd logisticspricer
```

### 2. Environment Configuration
```bash
# Copy environment template
cp env.example .env

# Configure for your environment
./scripts/setup-domains.sh -e development
```

### 3. Start Application
```bash
# Start everything with one command
./start.sh

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

## 🔧 Detailed Setup

### Development Environment

#### Manual Setup
```bash
# Backend setup
cd backend
npm install
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

#### Environment Variables (Development)
```bash
# .env file
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/logisticspricer
JWT_SECRET=your-dev-secret
CORS_ORIGIN=http://localhost:3000

# Domain configuration
DOMAIN=localhost
FRONTEND_DOMAIN=localhost
API_DOMAIN=localhost
BASE_URL=http://localhost:3000
API_URL=http://localhost:3001
```

### Staging Environment

#### Setup with Custom Domain
```bash
# Configure staging domains
./scripts/setup-domains.sh -e staging -d staging.yourdomain.com -a api-staging.yourdomain.com

# Deploy with Docker Compose
docker-compose up -d
```

#### Environment Variables (Staging)
```bash
NODE_ENV=staging
DOMAIN=staging.yourdomain.com
FRONTEND_DOMAIN=staging.yourdomain.com
API_DOMAIN=api-staging.yourdomain.com
BASE_URL=https://staging.yourdomain.com
API_URL=https://api-staging.yourdomain.com
```

### Production Environment

#### Setup with Production Domain
```bash
# Configure production domains
./scripts/setup-domains.sh -e production -d yourdomain.com -a api.yourdomain.com

# Deploy with Kubernetes
./deploy.sh production
```

#### Environment Variables (Production)
```bash
NODE_ENV=production
DOMAIN=yourdomain.com
FRONTEND_DOMAIN=yourdomain.com
API_DOMAIN=api.yourdomain.com
BASE_URL=https://yourdomain.com
API_URL=https://api.yourdomain.com
```

## 🐳 Docker Setup

### Prerequisites
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Quick Docker Deployment
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Custom Docker Configuration
```bash
# Build custom images
docker-compose build

# Run with custom environment
docker-compose --env-file .env.production up -d
```

## ☸️ Kubernetes Setup

### Prerequisites
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install minikube (for local testing)
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

### Local Kubernetes Testing
```bash
# Start minikube
minikube start

# Deploy application
kubectl apply -f k8s/deployment.yaml

# Access application
minikube service logisticspricer-frontend-service
```

### Production Kubernetes Deployment
```bash
# Deploy to production cluster
./deploy.sh production

# Check deployment status
kubectl get pods -n logisticspricer
kubectl get services -n logisticspricer
```

## 🌐 Domain Configuration

### DNS Setup
For custom domains, configure these DNS records:

#### Staging Environment
```
A     staging.yourdomain.com     -> YOUR_STAGING_SERVER_IP
A     api-staging.yourdomain.com -> YOUR_STAGING_SERVER_IP
```

#### Production Environment
```
A     yourdomain.com     -> YOUR_PRODUCTION_SERVER_IP
A     api.yourdomain.com -> YOUR_PRODUCTION_SERVER_IP
```

### SSL Certificate Setup
```bash
# Install certbot
sudo apt install certbot

# Get certificates
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# Certificates location
/etc/letsencrypt/live/yourdomain.com/
```

## 🔒 Security Configuration

### Environment Variables Security
```bash
# Generate secure secrets
openssl rand -base64 32  # JWT_SECRET
openssl rand -base64 32  # MONGO_ROOT_PASSWORD

# Store secrets securely
# Use Kubernetes secrets in production
kubectl create secret generic logisticspricer-secrets \
  --from-literal=JWT_SECRET=your-secret \
  --from-literal=MONGODB_URI=your-mongodb-uri
```

### Network Security
```bash
# Configure firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

## 📊 Monitoring Setup

### Health Checks
```bash
# Frontend health
curl http://localhost:3000/health

# Backend health
curl http://localhost:3001/api/v1/

# Docker health
docker-compose ps
```

### Logging
```bash
# View application logs
tail -f logs/backend.log
tail -f logs/frontend.log

# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🛠️ Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using the port
sudo lsof -i :3000
sudo lsof -i :3001

# Kill process if needed
sudo kill -9 <PID>
```

#### MongoDB Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB if stopped
sudo systemctl start mongod
```

#### Docker Issues
```bash
# Clean up Docker
docker system prune -a

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Performance Optimization
```bash
# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"

# Optimize MongoDB
# Add to /etc/mongod.conf
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 1
```

## 📚 Additional Resources

- **[Domain Setup Guide](domain-setup.md)** - Detailed domain configuration
- **[CI/CD Pipeline](ci-cd-pipeline.md)** - Deployment automation
- **[API Documentation](api-docs.md)** - Backend API reference
- **[Troubleshooting Guide](troubleshooting.md)** - Common issues and solutions

## 🎯 Next Steps

1. **Test the setup**: Run the application and verify all features work
2. **Configure monitoring**: Set up health checks and logging
3. **Deploy to staging**: Test in a staging environment
4. **Deploy to production**: Go live with your custom domain

---

*Last Updated: July 14, 2025*  
*Version: 1.0* 