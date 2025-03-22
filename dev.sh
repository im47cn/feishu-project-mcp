#!/bin/bash

# Set script to exit on error
set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print with color
print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check required tools
check_requirements() {
    print_color $YELLOW "Checking requirements..."

    if ! command_exists node; then
        print_color $RED "Node.js is not installed. Please install Node.js 18 or later."
        exit 1
    fi

    if ! command_exists npm; then
        print_color $RED "npm is not installed. Please install npm."
        exit 1
    fi

    if ! command_exists docker; then
        print_color $RED "Docker is not installed. Please install Docker."
        exit 1
    fi

    if ! command_exists docker-compose; then
        print_color $RED "Docker Compose is not installed. Please install Docker Compose."
        exit 1
    fi

    print_color $GREEN "All requirements satisfied!"
}

# Setup development environment
setup() {
    print_color $YELLOW "Setting up development environment..."

    # Install dependencies
    npm install

    # Create necessary directories
    mkdir -p storage/tasks logs

    # Copy environment files if they don't exist
    if [ ! -f .env ]; then
        cp .env.development .env
        print_color $YELLOW "Created .env from .env.development template"
    fi

    print_color $GREEN "Setup complete!"
}

# Start development environment
start() {
    print_color $YELLOW "Starting development environment..."
    docker-compose -f docker-compose.dev.yml up --build
}

# Stop development environment
stop() {
    print_color $YELLOW "Stopping development environment..."
    docker-compose -f docker-compose.dev.yml down
}

# Run tests
test() {
    print_color $YELLOW "Running tests..."
    npm test
}

# Run linting
lint() {
    print_color $YELLOW "Running linter..."
    npm run lint
}

# Clean development environment
clean() {
    print_color $YELLOW "Cleaning development environment..."

    # Stop containers
    docker-compose -f docker-compose.dev.yml down -v

    # Remove build artifacts
    rm -rf dist
    rm -rf coverage
    rm -rf node_modules

    # Remove logs and storage
    rm -rf logs/*
    rm -rf storage/*

    print_color $GREEN "Clean complete!"
}

# Show help
show_help() {
    echo "Usage: ./dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  setup     Setup development environment"
    echo "  start     Start development environment"
    echo "  stop      Stop development environment"
    echo "  test      Run tests"
    echo "  lint      Run linter"
    echo "  clean     Clean development environment"
    echo "  help      Show this help message"
}

# Main script
case "$1" in
    setup)
        check_requirements
        setup
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    test)
        test
        ;;
    lint)
        lint
        ;;
    clean)
        clean
        ;;
    help|*)
        show_help
        ;;
esac
