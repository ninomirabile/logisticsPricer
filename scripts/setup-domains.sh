#!/bin/bash

# LogisticsPricer Domain Setup Script
# This script helps configure domains for different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
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

# Function to create .env file
create_env_file() {
    local environment=$1
    local domain=$2
    local api_domain=$3
    
    log "Creating .env file for $environment environment..."
    
    # Create .env file
    cat > .env << EOF
# LogisticsPricer Environment Configuration
# Environment: $environment
# Generated on: $(date)

# =============================================================================
# ENVIRONMENT SETTINGS
# =============================================================================
NODE_ENV=$environment

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
MONGO_ROOT_PASSWORD=your-secure-password-$(date +%s)
MONGODB_URI=mongodb://admin:your-secure-password-$(date +%s)@localhost:27017/logisticspricer?authSource=admin

# =============================================================================
# SECURITY SETTINGS
# =============================================================================
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-$(date +%s)
CORS_ORIGIN=https://$domain

# =============================================================================
# DOMAIN CONFIGURATION
# =============================================================================

# Development Environment
DEV_BASE_URL=http://localhost:3000
DEV_API_URL=http://localhost:3001
DEV_DOMAIN=localhost

# Staging Environment
STAGING_BASE_URL=https://staging.$domain
STAGING_API_URL=https://api-staging.$domain
STAGING_DOMAIN=staging.$domain

# Production Environment
PROD_BASE_URL=https://$domain
PROD_API_URL=https://$api_domain
PROD_DOMAIN=$domain

# Current Environment (auto-detected from NODE_ENV)
DOMAIN=\${PROD_DOMAIN}
FRONTEND_DOMAIN=\${PROD_DOMAIN}
API_DOMAIN=\${PROD_DOMAIN}
BASE_URL=\${PROD_BASE_URL}
API_URL=\${PROD_API_URL}

# =============================================================================
# FRONTEND CONFIGURATION
# =============================================================================
VITE_API_URL=\${PROD_API_URL}
VITE_BASE_URL=\${PROD_BASE_URL}
VITE_APP_NAME=LogisticsPricer

# =============================================================================
# DOCKER CONFIGURATION
# =============================================================================
DOCKER_REGISTRY=your-docker-registry
IMAGE_TAG=latest

# =============================================================================
# MONITORING AND LOGGING
# =============================================================================
LOG_LEVEL=info
ENABLE_METRICS=true
ENABLE_HEALTH_CHECKS=true

# =============================================================================
# FEATURE FLAGS
# =============================================================================
ENABLE_RATE_LIMITING=true
ENABLE_CACHING=true
ENABLE_COMPRESSION=true

# =============================================================================
# EXTERNAL SERVICES (Optional)
# =============================================================================
# Redis for caching
REDIS_URL=redis://localhost:6379

# Email service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Payment gateway
STRIPE_PUBLIC_KEY=pk_test_your-stripe-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret
EOF

    success "Created .env file for $environment environment"
}

# Function to update Kubernetes config
update_k8s_config() {
    local domain=$1
    local api_domain=$2
    
    log "Updating Kubernetes configuration..."
    
    # Create a temporary file with updated domains
    sed -e "s/your-domain\.com/$domain/g" \
        -e "s/api\.your-domain\.com/$api_domain/g" \
        k8s/deployment.yaml > k8s/deployment-${domain}.yaml
    
    success "Updated Kubernetes configuration: k8s/deployment-${domain}.yaml"
}

# Function to validate domain format
validate_domain() {
    local domain=$1
    
    # Basic domain validation
    if [[ ! $domain =~ ^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$ ]]; then
        error "Invalid domain format: $domain"
        return 1
    fi
    
    return 0
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment ENV    Environment (development|staging|production)"
    echo "  -d, --domain DOMAIN      Main domain (e.g., example.com)"
    echo "  -a, --api-domain DOMAIN  API domain (e.g., api.example.com)"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -e production -d myapp.com -a api.myapp.com"
    echo "  $0 -e staging -d staging.myapp.com -a api-staging.myapp.com"
    echo "  $0 -e development"
    echo ""
}

# Main function
main() {
    local environment="development"
    local domain="localhost"
    local api_domain="localhost"
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                environment="$2"
                shift 2
                ;;
            -d|--domain)
                domain="$2"
                shift 2
                ;;
            -a|--api-domain)
                api_domain="$2"
                shift 2
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Validate environment
    case $environment in
        development|staging|production)
            ;;
        *)
            error "Invalid environment: $environment"
            error "Valid environments: development, staging, production"
            exit 1
            ;;
    esac
    
    # Validate domains for non-development environments
    if [[ $environment != "development" ]]; then
        if ! validate_domain "$domain"; then
            exit 1
        fi
        
        if ! validate_domain "$api_domain"; then
            exit 1
        fi
    fi
    
    log "Setting up domains for $environment environment..."
    log "Main domain: $domain"
    log "API domain: $api_domain"
    
    # Create .env file
    create_env_file "$environment" "$domain" "$api_domain"
    
    # Update Kubernetes config if not development
    if [[ $environment != "development" ]]; then
        update_k8s_config "$domain" "$api_domain"
    fi
    
    # Show next steps
    echo ""
    success "Domain setup completed!"
    echo ""
    log "Next steps:"
    echo "  1. Update your DNS records to point to your server"
    echo "  2. Configure SSL certificates (Let's Encrypt recommended)"
    echo "  3. Update the .env file with your actual secrets"
    echo "  4. Deploy with: ./deploy.sh $environment"
    echo ""
    
    if [[ $environment != "development" ]]; then
        echo "DNS Records to configure:"
        echo "  A     $domain        -> YOUR_SERVER_IP"
        echo "  A     $api_domain    -> YOUR_SERVER_IP"
        echo ""
    fi
}

# Run main function
main "$@" 