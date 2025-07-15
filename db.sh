#!/bin/bash

# LogisticsPricer - MongoDB Management Script
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

# Function to start MongoDB
start_mongodb() {
    print_status "Starting MongoDB..."
    
    if command_exists mongod; then
        if ! pgrep -x "mongod" >/dev/null; then
            if command_exists systemctl; then
                print_status "Starting MongoDB service..."
                sudo systemctl start mongod
                sleep 3
                
                if systemctl is-active --quiet mongod; then
                    print_success "MongoDB service started successfully"
                else
                    print_error "Failed to start MongoDB service"
                    return 1
                fi
            else
                print_status "Starting MongoDB manually..."
                mongod --fork --logpath /tmp/mongod.log --dbpath /tmp/mongodb
                sleep 3
                
                if pgrep -x "mongod" >/dev/null; then
                    print_success "MongoDB started successfully"
                else
                    print_error "Failed to start MongoDB"
                    return 1
                fi
            fi
        else
            print_success "MongoDB is already running"
        fi
    else
        print_error "MongoDB not found. Please install MongoDB first."
        print_status "Installation commands:"
        echo "  Ubuntu/Debian: sudo apt install mongodb"
        echo "  CentOS/RHEL: sudo yum install mongodb-org"
        echo "  macOS: brew install mongodb/brew/mongodb-community"
        return 1
    fi
}

# Function to stop MongoDB
stop_mongodb() {
    print_status "Stopping MongoDB..."
    
    if command_exists systemctl; then
        if systemctl is-active --quiet mongod; then
            print_status "Stopping MongoDB service..."
            sudo systemctl stop mongod
            print_success "MongoDB service stopped"
        else
            print_warning "MongoDB service is not running"
        fi
    else
        local mongodb_pid=$(pgrep -x "mongod" 2>/dev/null || echo "")
        if [ -n "$mongodb_pid" ]; then
            print_status "Stopping MongoDB process (PID: $mongodb_pid)..."
            kill "$mongodb_pid"
            
            # Wait for graceful shutdown
            local count=0
            while pgrep -x "mongod" >/dev/null && [ $count -lt 10 ]; do
                sleep 1
                count=$((count + 1))
            done
            
            if pgrep -x "mongod" >/dev/null; then
                print_warning "MongoDB didn't stop gracefully, forcing..."
                kill -9 "$mongodb_pid" 2>/dev/null || true
            fi
            
            print_success "MongoDB stopped"
        else
            print_warning "MongoDB is not running"
        fi
    fi
}

# Function to restart MongoDB
restart_mongodb() {
    print_status "Restarting MongoDB..."
    stop_mongodb
    sleep 2
    start_mongodb
}

# Function to check MongoDB status
check_mongodb_status() {
    print_status "Checking MongoDB status..."
    
    if command_exists systemctl; then
        if systemctl is-active --quiet mongod; then
            print_success "MongoDB service is running"
            systemctl status mongod --no-pager -l
        else
            print_warning "MongoDB service is not running"
        fi
    else
        local mongodb_pid=$(pgrep -x "mongod" 2>/dev/null || echo "")
        if [ -n "$mongodb_pid" ]; then
            print_success "MongoDB is running (PID: $mongodb_pid)"
            ps aux | grep mongod | grep -v grep
        else
            print_warning "MongoDB is not running"
        fi
    fi
    
    # Test connection
    if command_exists mongo; then
        print_status "Testing MongoDB connection..."
        if mongo --eval "db.runCommand('ping')" >/dev/null 2>&1; then
            print_success "MongoDB connection test successful"
        else
            print_warning "MongoDB connection test failed"
        fi
    fi
}

# Function to show MongoDB logs
show_mongodb_logs() {
    print_status "Showing MongoDB logs..."
    
    if command_exists systemctl; then
        if systemctl is-active --quiet mongod; then
            sudo journalctl -u mongod -f
        else
            print_warning "MongoDB service is not running"
        fi
    else
        if [ -f "/tmp/mongod.log" ]; then
            tail -f /tmp/mongod.log
        else
            print_warning "MongoDB log file not found"
        fi
    fi
}

# Function to backup MongoDB
backup_mongodb() {
    local backup_dir="${1:-./backups}"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_name="logisticspricer_backup_$timestamp"
    
    print_status "Creating MongoDB backup..."
    
    if ! command_exists mongodump; then
        print_error "mongodump not found. Please install MongoDB tools."
        return 1
    fi
    
    mkdir -p "$backup_dir"
    
    if mongodump --db logisticspricer --out "$backup_dir/$backup_name"; then
        print_success "Backup created: $backup_dir/$backup_name"
    else
        print_error "Backup failed"
        return 1
    fi
}

# Function to restore MongoDB
restore_mongodb() {
    local backup_path="$1"
    
    if [ -z "$backup_path" ]; then
        print_error "Please specify backup path"
        echo "Usage: $0 restore <backup_path>"
        return 1
    fi
    
    print_status "Restoring MongoDB from backup: $backup_path"
    
    if ! command_exists mongorestore; then
        print_error "mongorestore not found. Please install MongoDB tools."
        return 1
    fi
    
    if mongorestore --db logisticspricer "$backup_path/logisticspricer"; then
        print_success "Restore completed successfully"
    else
        print_error "Restore failed"
        return 1
    fi
}

# Main execution
main() {
    echo "=========================================="
    echo "    LogisticsPricer - MongoDB Manager"
    echo "=========================================="
    echo ""
    
    # Parse command line arguments
    case "${1:-status}" in
        "start")
            start_mongodb
            ;;
        "stop")
            stop_mongodb
            ;;
        "restart")
            restart_mongodb
            ;;
        "status")
            check_mongodb_status
            ;;
        "logs")
            show_mongodb_logs
            ;;
        "backup")
            backup_mongodb "$2"
            ;;
        "restore")
            restore_mongodb "$2"
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 {start|stop|restart|status|logs|backup|restore}"
            echo ""
            echo "Commands:"
            echo "  start    - Start MongoDB"
            echo "  stop     - Stop MongoDB"
            echo "  restart  - Restart MongoDB"
            echo "  status   - Check MongoDB status (default)"
            echo "  logs     - Show MongoDB logs"
            echo "  backup   - Create MongoDB backup"
            echo "  restore  - Restore MongoDB from backup"
            echo ""
            echo "Examples:"
            echo "  $0 start              # Start MongoDB"
            echo "  $0 status             # Check status"
            echo "  $0 backup ./backups   # Create backup"
            echo "  $0 restore ./backups/logisticspricer_backup_20250115_120000"
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
trap 'print_warning "Operation interrupted"; exit 1' INT TERM

# Run main function
main "$@" 