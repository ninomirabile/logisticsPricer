# 🛠️ Troubleshooting Guide

## Overview

This guide helps you resolve common issues when setting up and running the LogisticsPricer application.

## 🚨 Common Issues

### Application Won't Start

#### Issue: Port Already in Use
**Symptoms**: Error messages about ports 3000 or 3001 being in use

**Solution**:
```bash
# Check what's using the ports
sudo lsof -i :3000
sudo lsof -i :3001

# Kill the processes
sudo kill -9 <PID>

# Or use different ports
export PORT=3002  # For backend
export VITE_PORT=3003  # For frontend
```

#### Issue: MongoDB Connection Failed
**Symptoms**: Backend fails to start with MongoDB connection errors

**Solution**:
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB if stopped
sudo systemctl start mongod

# Check MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Verify connection string in .env
MONGODB_URI=mongodb://localhost:27017/logisticspricer
```

#### Issue: Node Modules Missing
**Symptoms**: "Cannot find module" errors

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Or use yarn
rm -rf node_modules yarn.lock
yarn install
```

### Docker Issues

#### Issue: Docker Containers Won't Start
**Symptoms**: `docker-compose up` fails

**Solution**:
```bash
# Check Docker status
sudo systemctl status docker

# Start Docker if stopped
sudo systemctl start docker

# Clean up Docker
docker system prune -a

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### Issue: Port Conflicts in Docker
**Symptoms**: Port binding errors

**Solution**:
```bash
# Check what's using the ports
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001

# Stop conflicting services
sudo systemctl stop nginx  # If using port 80
sudo systemctl stop apache2  # If using port 80

# Or change ports in docker-compose.yml
ports:
  - "3002:3001"  # Change host port
```

#### Issue: Docker Out of Space
**Symptoms**: "No space left on device" errors

**Solution**:
```bash
# Clean up Docker
docker system prune -a -f
docker volume prune -f
docker image prune -a -f

# Check disk space
df -h

# Clean up logs
sudo journalctl --vacuum-time=3d
```

### Kubernetes Issues

#### Issue: Pods Stuck in Pending
**Symptoms**: Pods not starting in Kubernetes

**Solution**:
```bash
# Check pod status
kubectl get pods -n logisticspricer
kubectl describe pod <pod-name> -n logisticspricer

# Check node resources
kubectl describe nodes

# Check events
kubectl get events -n logisticspricer --sort-by='.lastTimestamp'
```

#### Issue: Services Not Accessible
**Symptoms**: Can't access services from outside cluster

**Solution**:
```bash
# Check service status
kubectl get services -n logisticspricer

# Check ingress
kubectl get ingress -n logisticspricer
kubectl describe ingress logisticspricer-ingress -n logisticspricer

# Check if ingress controller is running
kubectl get pods -n ingress-nginx
```

### Domain and SSL Issues

#### Issue: Domain Not Resolving
**Symptoms**: Can't access custom domain

**Solution**:
```bash
# Check DNS propagation
nslookup yourdomain.com
dig yourdomain.com

# Check if DNS is configured correctly
# Verify A records point to your server IP

# Test locally
curl -H "Host: yourdomain.com" http://localhost
```

#### Issue: SSL Certificate Errors
**Symptoms**: Browser shows SSL warnings

**Solution**:
```bash
# Check certificate validity
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout

# Renew certificates
sudo certbot renew

# Check certificate dates
echo | openssl s_client -connect yourdomain.com:443 -servername yourdomain.com 2>/dev/null | openssl x509 -noout -dates
```

### Performance Issues

#### Issue: Slow Application Response
**Symptoms**: High response times

**Solution**:
```bash
# Check system resources
htop
free -h
df -h

# Check application logs
tail -f logs/backend.log
tail -f logs/frontend.log

# Optimize Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"

# Check MongoDB performance
mongosh --eval "db.stats()"
```

#### Issue: High Memory Usage
**Symptoms**: Application crashes or becomes unresponsive

**Solution**:
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Optimize MongoDB memory
# Edit /etc/mongod.conf
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 1

# Restart MongoDB
sudo systemctl restart mongod
```

## 🔧 Environment-Specific Issues

### Development Environment

#### Issue: Hot Reload Not Working
**Symptoms**: Changes not reflected in browser

**Solution**:
```bash
# Check if file watching is working
# On Linux, increase file watchers
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Restart development server
npm run dev
```

#### Issue: TypeScript Errors
**Symptoms**: TypeScript compilation errors

**Solution**:
```bash
# Check TypeScript version
npx tsc --version

# Clean and rebuild
rm -rf dist/
npm run build

# Check tsconfig.json
npx tsc --noEmit
```

### Production Environment

#### Issue: Application Crashes on Startup
**Symptoms**: Production deployment fails

**Solution**:
```bash
# Check environment variables
echo $NODE_ENV
echo $MONGODB_URI

# Check logs
docker-compose logs backend
kubectl logs -n logisticspricer deployment/logisticspricer-backend

# Verify secrets
kubectl get secrets -n logisticspricer
```

#### Issue: Database Connection Timeouts
**Symptoms**: Intermittent database errors

**Solution**:
```bash
# Check MongoDB connection pool
# Add to MongoDB connection string
?maxPoolSize=10&serverSelectionTimeoutMS=5000

# Check network connectivity
ping mongodb-host
telnet mongodb-host 27017

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

## 📊 Monitoring and Debugging

### Health Checks

#### Check Application Health
```bash
# Frontend health
curl http://localhost:3000/health

# Backend health
curl http://localhost:3001/api/v1/

# Docker health
docker-compose ps

# Kubernetes health
kubectl get pods -n logisticspricer
```

#### Check System Resources
```bash
# CPU and memory
htop
iostat -x 1

# Disk usage
df -h
du -sh /var/log/*

# Network
netstat -tulpn
ss -tulpn
```

### Log Analysis

#### View Application Logs
```bash
# Real-time logs
tail -f logs/backend.log
tail -f logs/frontend.log

# Search for errors
grep -i error logs/backend.log
grep -i error logs/frontend.log

# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Kubernetes logs
kubectl logs -f -n logisticspricer deployment/logisticspricer-backend
```

#### Analyze Performance
```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3001/api/v1/"

# Monitor API calls
watch -n 1 'curl -s http://localhost:3001/api/v1/ | jq .'

# Check database queries
mongosh --eval "db.currentOp()"
```

## 🚀 Recovery Procedures

### Application Recovery
```bash
# Restart application
./stop.sh
./start.sh

# Or restart specific services
docker-compose restart backend
docker-compose restart frontend
```

### Database Recovery
```bash
# Backup database
mongodump --db logisticspricer --out /backup/

# Restore database
mongorestore --db logisticspricer /backup/logisticspricer/

# Check database integrity
mongosh --eval "db.repairDatabase()"
```

### Full System Recovery
```bash
# Stop all services
./stop.sh force

# Clean up
docker system prune -a -f
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Restart
./start.sh
```

## 📞 Getting Help

### Before Asking for Help
1. **Check this guide** for your specific issue
2. **Check the logs** for error messages
3. **Verify your environment** matches the requirements
4. **Test with minimal configuration**

### Useful Commands for Debugging
```bash
# System information
uname -a
node --version
npm --version
docker --version

# Application status
./stop.sh status
docker-compose ps
kubectl get all -n logisticspricer

# Network connectivity
ping google.com
curl -I http://localhost:3000
curl -I http://localhost:3001
```

### Where to Get Help
- **GitHub Issues**: Create an issue with detailed information
- **Documentation**: Check [docs/README.md](README.md)
- **Community**: Check project discussions
- **Logs**: Always include relevant logs when reporting issues

## 🎯 Prevention Tips

### Regular Maintenance
- **Update dependencies** regularly
- **Monitor system resources** continuously
- **Backup data** regularly
- **Test deployments** in staging first

### Best Practices
- **Use environment variables** for configuration
- **Implement proper logging** for debugging
- **Set up monitoring** and alerting
- **Document custom configurations**

---

*Last Updated: July 14, 2025*  
*Version: 1.0* 