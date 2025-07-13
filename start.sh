#!/bin/bash

# LogisticsPricer - Start Script
# Author: Antonino Mirabile
# License: CC-BY-NC-4.0

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to wait for a service to be ready
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    local max_attempts=30
    local attempt=1

    print_status "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if nc -z $host $port 2>/dev/null; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start within $((max_attempts * 2)) seconds"
    return 1
}

# Function to start MongoDB
start_mongodb() {
    print_status "Checking MongoDB..."
    
    if command_exists mongod; then
        if ! pgrep -x "mongod" >/dev/null; then
            print_status "Starting MongoDB..."
            if command_exists systemctl; then
                sudo systemctl start mongod
            else
                mongod --fork --logpath /tmp/mongod.log --dbpath /tmp/mongodb
            fi
            sleep 3
        else
            print_success "MongoDB is already running"
        fi
    else
        print_warning "MongoDB not found. Please install MongoDB or use Docker."
        print_status "You can start MongoDB with Docker: docker run -d -p 27017:27017 --name mongodb mongo:6.0"
    fi
}

# Function to start backend
start_backend() {
    print_status "Starting Backend..."
    
    if [ ! -d "backend" ]; then
        print_error "Backend directory not found!"
        exit 1
    fi
    
    cd backend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing backend dependencies..."
        npm install
    fi
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        print_warning "Backend .env file not found. Creating default configuration..."
        cat > .env << EOF
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/logisticspricer
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
    fi
    
    # Start backend in background
    print_status "Starting backend server on port 5000..."
    npm run dev > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../logs/backend.pid
    
    cd ..
    
    # Wait for backend to be ready
    wait_for_service localhost 5000 "Backend"
}

# Function to start frontend
start_frontend() {
    print_status "Starting Frontend..."
    
    if [ ! -d "frontend" ]; then
        print_error "Frontend directory not found!"
        exit 1
    fi
    
    cd frontend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm install
    fi
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        print_warning "Frontend .env file not found. Creating default configuration..."
        cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=LogisticsPricer
EOF
    fi
    
    # Start frontend in background
    print_status "Starting frontend server on port 3000..."
    npm run dev > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../logs/frontend.pid
    
    cd ..
    
    # Wait for frontend to be ready
    wait_for_service localhost 3000 "Frontend"
}

# Main execution
main() {
    echo "=========================================="
    echo "    LogisticsPricer - Start Script"
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm"
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js version: $(node -v)"
    print_success "npm version: $(npm -v)"
    
    # Create logs directory
    mkdir -p logs
    
    # Check if already running
    if [ -f "logs/backend.pid" ] && [ -f "logs/frontend.pid" ]; then
        print_warning "Application might already be running. Use ./stop.sh to stop it first."
        read -p "Do you want to continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 0
        fi
    fi
    
    # Start services
    start_mongodb
    start_backend
    start_frontend
    
    echo ""
    echo "=========================================="
    print_success "LogisticsPricer is now running!"
    echo "=========================================="
    echo ""
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:5000"
    echo "📊 API Health: http://localhost:5000/health"
    echo ""
    echo "📝 Logs:"
    echo "   Backend:  tail -f logs/backend.log"
    echo "   Frontend: tail -f logs/frontend.log"
    echo ""
    echo "🛑 To stop: ./stop.sh"
    echo ""
    
    # Save PIDs for later use
    echo "BACKEND_PID=$BACKEND_PID" > logs/pids.env
    echo "FRONTEND_PID=$FRONTEND_PID" >> logs/pids.env
    
    print_success "Startup completed successfully!"
}

# Handle script interruption
trap 'print_warning "Startup interrupted. Cleaning up..."; exit 1' INT TERM

# Run main function
main "$@" 