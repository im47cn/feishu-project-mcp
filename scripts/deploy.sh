#!/bin/bash

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print with color
print_status() {
    echo -e "${GREEN}==>${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}Warning:${NC} $1"
}

print_error() {
    echo -e "${RED}Error:${NC} $1"
}

# Check if Docker is running
check_docker() {
    print_status "Checking Docker..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Check environment variables
check_env() {
    print_status "Checking environment variables..."
    if [ -z "$FEISHU_TOKEN" ]; then
        print_error "FEISHU_TOKEN environment variable is not set"
        exit 1
    fi
}

# Build Docker images
build_images() {
    print_status "Building Docker images..."
    docker-compose build
}

# Deploy containers
deploy() {
    print_status "Deploying containers..."
    
    # Stop existing containers
    docker-compose down || true
    
    # Start new containers
    docker-compose up -d
    
    # Wait for health check
    print_status "Waiting for service to be healthy..."
    ATTEMPTS=0
    MAX_ATTEMPTS=30
    
    until [ $ATTEMPTS -eq $MAX_ATTEMPTS ] || docker ps | grep feishu-project-mcp | grep -q "healthy"; do
        ATTEMPTS=$((ATTEMPTS + 1))
        sleep 2
        echo -n "."
    done
    
    if [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; then
        print_error "Service failed to become healthy within 60 seconds"
        docker-compose logs
        exit 1
    fi
    
    echo ""
    print_status "Service is healthy!"
}

# Show logs
show_logs() {
    print_status "Showing service logs..."
    docker-compose logs -f
}

# Cleanup function
cleanup() {
    if [ $? -ne 0 ]; then
        print_error "Deployment failed! Rolling back..."
        docker-compose down
        exit 1
    fi
}

# Main function
main() {
    local SHOW_LOGS=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --logs)
                SHOW_LOGS=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Check prerequisites
    check_docker
    check_env
    
    # Build and deploy
    build_images
    deploy
    
    print_status "Deployment completed successfully!"
    
    # Show logs if requested
    if [ "$SHOW_LOGS" = true ]; then
        show_logs
    else
        print_status "To view logs, run: docker-compose logs -f"
    fi
}

# Set up error handling
trap cleanup EXIT

# Run main function with all arguments
main "$@"