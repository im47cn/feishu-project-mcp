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

# Check if openapi-typescript-codegen is installed
check_dependencies() {
    if ! command -v openapi &> /dev/null; then
        print_status "Installing openapi-typescript-codegen..."
        npm install -g openapi-typescript-codegen
    fi
}

# Create output directories
create_directories() {
    mkdir -p src/types/generated
    mkdir -p src/types/schemas
}

# Generate types from OpenAPI spec
generate_types() {
    local spec_file=$1
    local output_dir=$2
    local client_name=$3

    print_status "Generating types from ${spec_file}..."

    openapi \
        --input "${spec_file}" \
        --output "${output_dir}" \
        --client fetch \
        --name "${client_name}" \
        --useUnionTypes \
        --exportSchemas true \
        --exportServices true \
        --exportCore false

    print_status "Types generated successfully in ${output_dir}"
}

# Generate Feishu API types
generate_feishu_types() {
    print_status "Generating Feishu API types..."

    # Download latest Feishu OpenAPI spec if not exists
    if [ ! -f "specs/feishu.json" ]; then
        mkdir -p specs
        curl -o specs/feishu.json https://open.feishu.cn/api/openapi.json
    fi

    generate_types \
        "specs/feishu.json" \
        "src/types/generated/feishu" \
        "FeishuAPI"
}

# Clean up generated files
cleanup() {
    print_status "Cleaning up generated files..."
    rm -rf src/types/generated/*
    rm -rf src/types/schemas/*
}

# Format generated files
format_files() {
    print_status "Formatting generated files..."
    npm run format
}

# Show help
show_help() {
    echo "Type Generation Script"
    echo
    echo "Usage:"
    echo "  $0 <command> [options]"
    echo
    echo "Commands:"
    echo "  generate:feishu     Generate Feishu API types"
    echo "  generate:custom     Generate types from custom OpenAPI spec"
    echo "  clean              Clean up generated files"
    echo "  help               Show this help message"
    echo
    echo "Options:"
    echo "  --spec <file>      OpenAPI specification file"
    echo "  --output <dir>     Output directory"
    echo "  --name <name>      Client name"
}

# Main script
case "$1" in
    "generate:feishu")
        check_dependencies
        create_directories
        generate_feishu_types
        format_files
        ;;
    "generate:custom")
        if [ -z "$2" ]; then
            print_error "Please provide an OpenAPI spec file"
            exit 1
        fi
        check_dependencies
        create_directories
        generate_types "$2" "src/types/generated/custom" "CustomAPI"
        format_files
        ;;
    "clean")
        cleanup
        ;;
    "help"|"")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac

print_status "Done! 🎉"
