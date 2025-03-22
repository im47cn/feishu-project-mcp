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

# Clean up previous test containers and volumes
cleanup() {
    print_status "Cleaning up previous test environment..."
    docker-compose -f docker-compose.yml down -v 2>/dev/null || true
    docker rm -f feishu-project-mcp-test 2>/dev/null || true
    rm -rf coverage/* test-storage/* test-logs/* 2>/dev/null || true
}

# Build test container
build_test_container() {
    print_status "Building test container..."
    docker-compose -f docker-compose.yml build test
}

# Run tests
run_tests() {
    print_status "Running tests..."
    docker-compose -f docker-compose.yml run --rm test

    # Copy coverage reports from container
    print_status "Copying coverage reports..."
    docker cp $(docker ps -aqf "name=feishu-project-mcp-test"):/app/coverage ./coverage
}

# Main function
main() {
    # Check prerequisites
    check_docker

    # Clean up previous runs
    cleanup

    # Build and run tests
    build_test_container
    run_tests

    print_status "Tests completed successfully!"
}

# Run main function
main

# Handle errors
trap 'print_error "An error occurred. Cleaning up..." && cleanup' ERR