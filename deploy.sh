#!/bin/bash

# LogisticsPricer Deployment Script
# This script handles building, testing, and deploying the application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
DOCKER_REGISTRY=${DOCKER_REGISTRY:-""}
IMAGE_TAG=${IMAGE_TAG:-"latest"}

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    success "All prerequisites are satisfied"
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Backend tests
    log "Running backend tests..."
    cd backend
    npm ci
    npm test
    cd ..
    
    # Frontend tests
    log "Running frontend tests..."
    cd frontend
    npm ci
    npm test
    cd ..
    
    success "All tests passed"
}

# Build Docker images
build_images() {
    log "Building Docker images..."
    
    # Build backend image
    log "Building backend image..."
    docker build -t logisticspricer-backend:$IMAGE_TAG ./backend
    
    # Build frontend image
    log "Building frontend image..."
    docker build -t logisticspricer-frontend:$IMAGE_TAG ./frontend
    
    success "Docker images built successfully"
}

# Push images to registry (if configured)
push_images() {
    if [ -n "$DOCKER_REGISTRY" ]; then
        log "Pushing images to registry..."
        
        # Tag images
        docker tag logisticspricer-backend:$IMAGE_TAG $DOCKER_REGISTRY/logisticspricer-backend:$IMAGE_TAG
        docker tag logisticspricer-frontend:$IMAGE_TAG $DOCKER_REGISTRY/logisticspricer-frontend:$IMAGE_TAG
        
        # Push images
        docker push $DOCKER_REGISTRY/logisticspricer-backend:$IMAGE_TAG
        docker push $DOCKER_REGISTRY/logisticspricer-frontend:$IMAGE_TAG
        
        success "Images pushed to registry"
    else
        warning "No Docker registry configured, skipping push"
    fi
}

# Deploy application
deploy() {
    log "Deploying application to $ENVIRONMENT environment..."
    
    # Stop existing containers
    log "Stopping existing containers..."
    docker-compose down --remove-orphans
    
    # Start services
    if [ "$ENVIRONMENT" = "production" ]; then
        log "Starting production environment..."
        docker-compose --profile production up -d
    else
        log "Starting development environment..."
        docker-compose up -d
    fi
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    check_health
    
    success "Application deployed successfully"
}

# Check service health
check_health() {
    log "Checking service health..."
    
    # Check backend health
    if curl -f http://localhost:3001/api/v1/ > /dev/null 2>&1; then
        success "Backend is healthy"
    else
        error "Backend health check failed"
        exit 1
    fi
    
    # Check frontend health
    if curl -f http://localhost:3000/ > /dev/null 2>&1; then
        success "Frontend is healthy"
    else
        error "Frontend health check failed"
        exit 1
    fi
}

# Cleanup function
cleanup() {
    log "Cleaning up..."
    
    # Remove unused Docker images
    docker image prune -f
    
    # Remove unused Docker volumes
    docker volume prune -f
    
    success "Cleanup completed"
}

# Main deployment flow
main() {
    log "Starting LogisticsPricer deployment..."
    log "Environment: $ENVIRONMENT"
    log "Image tag: $IMAGE_TAG"
    
    check_prerequisites
    run_tests
    build_images
    push_images
    deploy
    cleanup
    
    success "Deployment completed successfully!"
    log "Application is available at:"
    log "  Frontend: http://localhost:3000"
    log "  Backend API: http://localhost:3001"
    log "  API Documentation: http://localhost:3001/api/v1/"
}

# Handle script interruption
trap 'error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@" 