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

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16 or later."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    if (( ${NODE_VERSION%%.*} < 16 )); then
        print_error "Node.js version must be 16 or later. Current version: $NODE_VERSION"
        exit 1
    fi
    
    print_status "Node.js version $NODE_VERSION detected"
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_status "npm $(npm -v) detected"
}

# Create necessary directories
create_directories() {
    print_status "Creating project directories..."
    
    # Create directories if they don't exist
    mkdir -p storage
    mkdir -p logs
    
    # Create .gitkeep files to track empty directories
    touch storage/.gitkeep
    touch logs/.gitkeep
    
    print_status "Project directories created"
}

# Install dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    npm install
    print_status "Dependencies installed successfully"
}

# Build the project
build_project() {
    print_status "Building the project..."
    npm run build
    print_status "Project built successfully"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    npm test
    print_status "Tests completed successfully"
}

# Setup git hooks
setup_git_hooks() {
    print_status "Setting up git hooks..."
    
    # Create pre-commit hook
    mkdir -p .git/hooks
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
npm run lint
npm run test
EOF
    
    chmod +x .git/hooks/pre-commit
    print_status "Git hooks configured"
}

# Main setup process
main() {
    echo "Starting project setup..."
    
    # Run checks
    check_node
    check_npm
    
    # Create project structure
    create_directories
    
    # Install and build
    install_dependencies
    build_project
    
    # Setup development tools
    setup_git_hooks
    
    # Run tests
    run_tests
    
    echo -e "\n${GREEN}Setup completed successfully!${NC}"
    echo -e "\nNext steps:"
    echo "1. Create a .env file with your configuration"
    echo "2. Start the development server with: npm run dev"
    echo "3. Read the documentation in the README.md file"
}

# Run main function
main