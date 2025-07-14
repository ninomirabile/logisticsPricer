# 🌐 LogisticsPricer Domain Configuration

## Overview

This document explains how to configure domains for the LogisticsPricer application across different environments (development, staging, production).

## 🎯 Centralized URL Management

We've created a centralized URL configuration system that makes it easy to manage domains across all environments:

### 📁 Configuration Files

1. **`config/urls.js`** - Centralized URL configuration
2. **`env.example`** - Environment variables template
3. **`scripts/setup-domains.sh`** - Automated domain setup script
4. **`docker-compose.yml`** - Docker environment variables
5. **`k8s/deployment.yaml`** - Kubernetes configuration

## 🚀 Quick Setup

### 1. **Development Environment (Default)**
```bash
# Uses localhost automatically
./scripts/setup-domains.sh -e development
```

### 2. **Staging Environment**
```bash
./scripts/setup-domains.sh -e staging -d staging.myapp.com -a api-staging.myapp.com
```

### 3. **Production Environment**
```bash
./scripts/setup-domains.sh -e production -d myapp.com -a api.myapp.com
```

## 📋 Environment Variables

### **Development**
```bash
NODE_ENV=development
DOMAIN=localhost
FRONTEND_DOMAIN=localhost
API_DOMAIN=localhost
BASE_URL=http://localhost:3000
API_URL=http://localhost:3001
```

### **Staging**
```bash
NODE_ENV=staging
DOMAIN=staging.myapp.com
FRONTEND_DOMAIN=staging.myapp.com
API_DOMAIN=api-staging.myapp.com
BASE_URL=https://staging.myapp.com
API_URL=https://api-staging.myapp.com
```

### **Production**
```bash
NODE_ENV=production
DOMAIN=myapp.com
FRONTEND_DOMAIN=myapp.com
API_DOMAIN=api.myapp.com
BASE_URL=https://myapp.com
API_URL=https://api.myapp.com
```

## 🔧 Manual Configuration

### **1. Create .env file**
```bash
# Copy the example file
cp env.example .env

# Edit with your domains
nano .env
```

### **2. Update Docker Compose**
```bash
# The docker-compose.yml already uses environment variables
# Just set your .env file and run:
docker-compose up -d
```

### **3. Update Kubernetes (if using)**
```bash
# Edit k8s/deployment.yaml
# Replace 'your-domain.com' with your actual domain
# Or use the setup script to generate it automatically
```

## 🌍 Domain Structure Examples

### **Option 1: Subdomain for API**
```
Frontend: https://myapp.com
API:      https://api.myapp.com
```

### **Option 2: Path-based API**
```
Frontend: https://myapp.com
API:      https://myapp.com/api
```

### **Option 3: Separate Domains**
```
Frontend: https://myapp.com
API:      https://api-logistics.com
```

## 🔒 SSL/HTTPS Configuration

### **Automatic SSL with Let's Encrypt**
```bash
# Install certbot
sudo apt install certbot

# Get certificates
sudo certbot certonly --standalone -d myapp.com -d api.myapp.com

# Certificates will be in /etc/letsencrypt/live/
```

### **Manual SSL Configuration**
```bash
# Create SSL directory
mkdir -p nginx/ssl

# Copy your certificates
cp /path/to/cert.pem nginx/ssl/
cp /path/to/key.pem nginx/ssl/
```

## 🚀 Deployment Examples

### **Development**
```bash
# Start with localhost
./scripts/setup-domains.sh -e development
./deploy.sh development
```

### **Staging**
```bash
# Setup staging domains
./scripts/setup-domains.sh -e staging -d staging.myapp.com -a api-staging.myapp.com

# Deploy to staging
./deploy.sh staging
```

### **Production**
```bash
# Setup production domains
./scripts/setup-domains.sh -e production -d myapp.com -a api.myapp.com

# Deploy to production
./deploy.sh production
```

## 📊 DNS Configuration

### **Required DNS Records**

For each environment, you need to configure these DNS records:

#### **Development**
```
No DNS configuration needed (uses localhost)
```

#### **Staging**
```
A     staging.myapp.com     -> YOUR_STAGING_SERVER_IP
A     api-staging.myapp.com -> YOUR_STAGING_SERVER_IP
```

#### **Production**
```
A     myapp.com     -> YOUR_PRODUCTION_SERVER_IP
A     api.myapp.com -> YOUR_PRODUCTION_SERVER_IP
```

### **Optional DNS Records**
```
CNAME  www.myapp.com     -> myapp.com
CNAME  www.api.myapp.com -> api.myapp.com
```

## 🔍 Testing Domain Configuration

### **1. Test Local Development**
```bash
# Start the application
./start.sh

# Test endpoints
curl http://localhost:3001/api/v1/
curl http://localhost:3000/
```

### **2. Test Staging/Production**
```bash
# Test frontend
curl -I https://myapp.com

# Test API
curl -I https://api.myapp.com/api/v1/

# Test SSL
openssl s_client -connect myapp.com:443 -servername myapp.com
```

## 🛠️ Troubleshooting

### **Common Issues**

1. **Domain not resolving**
   ```bash
   # Check DNS propagation
   nslookup myapp.com
   dig myapp.com
   
   # Check if DNS is configured correctly
   ```

2. **SSL certificate issues**
   ```bash
   # Check certificate validity
   openssl x509 -in /etc/letsencrypt/live/myapp.com/cert.pem -text -noout
   
   # Renew certificates
   sudo certbot renew
   ```

3. **CORS errors**
   ```bash
   # Check CORS configuration in .env
   CORS_ORIGIN=https://myapp.com
   
   # Verify frontend is calling correct API URL
   ```

### **Debug Commands**
```bash
# Check environment variables
docker-compose config

# Check container logs
docker-compose logs frontend
docker-compose logs backend

# Test connectivity
curl -v https://myapp.com
curl -v https://api.myapp.com/api/v1/
```

## 📈 Monitoring

### **Health Checks**
```bash
# Frontend health
curl https://myapp.com/health

# API health
curl https://api.myapp.com/api/v1/

# Docker health
docker-compose ps
```

### **SSL Monitoring**
```bash
# Check certificate expiration
echo | openssl s_client -connect myapp.com:443 -servername myapp.com 2>/dev/null | openssl x509 -noout -dates
```

## 🔄 Environment Switching

### **Switch Between Environments**
```bash
# Development
./scripts/setup-domains.sh -e development
docker-compose down && docker-compose up -d

# Staging
./scripts/setup-domains.sh -e staging -d staging.myapp.com -a api-staging.myapp.com
docker-compose down && docker-compose up -d

# Production
./scripts/setup-domains.sh -e production -d myapp.com -a api.myapp.com
docker-compose down && docker-compose up -d
```

## 📚 Best Practices

1. **Always use HTTPS in production**
2. **Keep staging and production domains separate**
3. **Use descriptive subdomains (api, staging, etc.)**
4. **Monitor SSL certificate expiration**
5. **Test domain configuration before deployment**
6. **Use environment-specific secrets**
7. **Document DNS changes**

## 🎯 Next Steps

1. **Choose your domain structure**
2. **Run the setup script for your environment**
3. **Configure DNS records**
4. **Set up SSL certificates**
5. **Deploy and test**
6. **Monitor and maintain**

---

**🎉 Your LogisticsPricer application is now ready for any domain configuration!** 