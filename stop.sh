#!/bin/bash

# LogisticsPricer - Stop Script
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

# Function to check if a process is running
is_process_running() {
    local pid=$1
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to stop a process gracefully
stop_process() {
    local pid=$1
    local process_name=$2
    local force_kill=${3:-false}
    
    if [ -n "$pid" ] && is_process_running "$pid"; then
        print_status "Stopping $process_name (PID: $pid)..."
        
        if [ "$force_kill" = true ]; then
            kill -9 "$pid" 2>/dev/null || true
        else
            kill "$pid" 2>/dev/null || true
            
            # Wait for graceful shutdown
            local count=0
            while is_process_running "$pid" && [ $count -lt 10 ]; do
                sleep 1
                count=$((count + 1))
            done
            
            # Force kill if still running
            if is_process_running "$pid"; then
                print_warning "$process_name didn't stop gracefully, forcing..."
                kill -9 "$pid" 2>/dev/null || true
            fi
        fi
        
        print_success "$process_name stopped"
    else
        print_warning "$process_name is not running"
    fi
}

# Function to stop backend
stop_backend() {
    if [ -f "logs/backend.pid" ]; then
        BACKEND_PID=$(cat logs/backend.pid)
        stop_process "$BACKEND_PID" "Backend"
        rm -f logs/backend.pid
    else
        print_warning "Backend PID file not found"
        
        # Try to find backend process by port
        BACKEND_PID=$(lsof -ti:5000 2>/dev/null || echo "")
        if [ -n "$BACKEND_PID" ]; then
            print_status "Found backend process on port 5000, stopping..."
            stop_process "$BACKEND_PID" "Backend (port 5000)"
        fi
    fi
}

# Function to stop frontend
stop_frontend() {
    if [ -f "logs/frontend.pid" ]; then
        FRONTEND_PID=$(cat logs/frontend.pid)
        stop_process "$FRONTEND_PID" "Frontend"
        rm -f logs/frontend.pid
    else
        print_warning "Frontend PID file not found"
        
        # Try to find frontend process by port
        FRONTEND_PID=$(lsof -ti:3000 2>/dev/null || echo "")
        if [ -n "$FRONTEND_PID" ]; then
            print_status "Found frontend process on port 3000, stopping..."
            stop_process "$FRONTEND_PID" "Frontend (port 3000)"
        fi
    fi
}

# Function to stop MongoDB (optional)
stop_mongodb() {
    print_status "Checking MongoDB..."
    
    if command -v systemctl >/dev/null 2>&1; then
        if systemctl is-active --quiet mongod; then
            print_status "Stopping MongoDB service..."
            sudo systemctl stop mongod
            print_success "MongoDB service stopped"
        else
            print_warning "MongoDB service is not running"
        fi
    else
        # Try to find mongod process
        MONGODB_PID=$(pgrep -x "mongod" 2>/dev/null || echo "")
        if [ -n "$MONGODB_PID" ]; then
            print_status "Found MongoDB process, stopping..."
            stop_process "$MONGODB_PID" "MongoDB"
        else
            print_warning "MongoDB is not running"
        fi
    fi
}

# Function to clean up temporary files
cleanup() {
    print_status "Cleaning up temporary files..."
    
    # Remove PID files
    rm -f logs/backend.pid logs/frontend.pid logs/pids.env
    
    # Clean up any remaining processes on our ports
    local backend_pid=$(lsof -ti:5000 2>/dev/null || echo "")
    local frontend_pid=$(lsof -ti:3000 2>/dev/null || echo "")
    
    if [ -n "$backend_pid" ]; then
        print_warning "Found remaining process on port 5000, stopping..."
        stop_process "$backend_pid" "Remaining backend process" true
    fi
    
    if [ -n "$frontend_pid" ]; then
        print_warning "Found remaining process on port 3000, stopping..."
        stop_process "$frontend_pid" "Remaining frontend process" true
    fi
    
    print_success "Cleanup completed"
}

# Function to show status
show_status() {
    echo "=========================================="
    echo "    LogisticsPricer - Status Check"
    echo "=========================================="
    echo ""
    
    # Check backend
    if [ -f "logs/backend.pid" ]; then
        BACKEND_PID=$(cat logs/backend.pid)
        if is_process_running "$BACKEND_PID"; then
            print_success "Backend: Running (PID: $BACKEND_PID)"
        else
            print_error "Backend: PID file exists but process not running"
        fi
    else
        local backend_pid=$(lsof -ti:5000 2>/dev/null || echo "")
        if [ -n "$backend_pid" ]; then
            print_warning "Backend: Running on port 5000 (PID: $backend_pid) - no PID file"
        else
            print_warning "Backend: Not running"
        fi
    fi
    
    # Check frontend
    if [ -f "logs/frontend.pid" ]; then
        FRONTEND_PID=$(cat logs/frontend.pid)
        if is_process_running "$FRONTEND_PID"; then
            print_success "Frontend: Running (PID: $FRONTEND_PID)"
        else
            print_error "Frontend: PID file exists but process not running"
        fi
    else
        local frontend_pid=$(lsof -ti:3000 2>/dev/null || echo "")
        if [ -n "$frontend_pid" ]; then
            print_warning "Frontend: Running on port 3000 (PID: $frontend_pid) - no PID file"
        else
            print_warning "Frontend: Not running"
        fi
    fi
    
    # Check MongoDB
    if command -v systemctl >/dev/null 2>&1; then
        if systemctl is-active --quiet mongod; then
            print_success "MongoDB: Service running"
        else
            print_warning "MongoDB: Service not running"
        fi
    else
        local mongodb_pid=$(pgrep -x "mongod" 2>/dev/null || echo "")
        if [ -n "$mongodb_pid" ]; then
            print_success "MongoDB: Running (PID: $mongodb_pid)"
        else
            print_warning "MongoDB: Not running"
        fi
    fi
    
    echo ""
}

# Main execution
main() {
    echo "=========================================="
    echo "    LogisticsPricer - Stop Script"
    echo "=========================================="
    echo ""
    
    # Parse command line arguments
    case "${1:-stop}" in
        "stop")
            print_status "Stopping LogisticsPricer services..."
            stop_frontend
            stop_backend
            cleanup
            print_success "All services stopped successfully!"
            ;;
        "status")
            show_status
            ;;
        "force")
            print_warning "Force stopping all services..."
            stop_frontend
            stop_backend
            cleanup
            print_success "All services force stopped!"
            ;;
        "mongodb")
            print_status "Stopping MongoDB only..."
            stop_mongodb
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  stop     Stop all services (default)"
            echo "  status   Show status of all services"
            echo "  force    Force stop all services"
            echo "  mongodb  Stop MongoDB only"
            echo "  help     Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0        # Stop all services"
            echo "  $0 status # Check service status"
            echo "  $0 force  # Force stop everything"
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
    
    echo ""
    echo "=========================================="
    print_success "Operation completed!"
    echo "=========================================="
}

# Handle script interruption
trap 'print_warning "Stop operation interrupted."; exit 1' INT TERM

# Run main function
main "$@" 