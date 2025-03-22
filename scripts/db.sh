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

# Check environment
check_env() {
    if [ -z "$DATABASE_URL" ]; then
        print_error "DATABASE_URL environment variable is not set"
        exit 1
    fi
}

# Create migration
create_migration() {
    if [ -z "$1" ]; then
        print_error "Please provide a migration name"
        exit 1
    fi

    MIGRATION_NAME=$1
    TIMESTAMP=$(date +%Y%m%d%H%M%S)
    FILENAME="${TIMESTAMP}_${MIGRATION_NAME}.ts"

    mkdir -p src/database/migrations

    cat > "src/database/migrations/$FILENAME" << EOL
import { Migration } from '../types';

export const up: Migration = async (db) => {
    // Add your migration code here
};

export const down: Migration = async (db) => {
    // Add your rollback code here
};
EOL

    print_status "Created migration: $FILENAME"
}

# Run migrations
run_migrations() {
    print_status "Running migrations..."
    check_env

    # Add your migration runner code here
    # Example: npx typeorm migration:run

    print_status "Migrations completed successfully"
}

# Rollback migrations
rollback_migrations() {
    print_status "Rolling back migrations..."
    check_env

    # Add your rollback code here
    # Example: npx typeorm migration:revert

    print_status "Rollback completed successfully"
}

# Create seed
create_seed() {
    if [ -z "$1" ]; then
        print_error "Please provide a seed name"
        exit 1
    }

    SEED_NAME=$1
    TIMESTAMP=$(date +%Y%m%d%H%M%S)
    FILENAME="${TIMESTAMP}_${SEED_NAME}.ts"

    mkdir -p src/database/seeds

    cat > "src/database/seeds/$FILENAME" << EOL
import { Seed } from '../types';

export const seed: Seed = async (db) => {
    // Add your seed data here
};

export const clean: Seed = async (db) => {
    // Add your cleanup code here
};
EOL

    print_status "Created seed: $FILENAME"
}

# Run seeds
run_seeds() {
    print_status "Running seeds..."
    check_env

    # Add your seed runner code here
    # Example: npx typeorm seed:run

    print_status "Seeds completed successfully"
}

# Show help
show_help() {
    echo "Database Management Script"
    echo
    echo "Usage:"
    echo "  $0 <command> [options]"
    echo
    echo "Commands:"
    echo "  create:migration <name>  Create a new migration"
    echo "  migrate                  Run all pending migrations"
    echo "  rollback                 Rollback the last migration"
    echo "  create:seed <name>       Create a new seed file"
    echo "  seed                     Run all seeds"
    echo "  reset                    Rollback all migrations and run them again"
    echo "  fresh                    Drop all tables and run migrations"
    echo "  status                   Show migration status"
    echo
    echo "Options:"
    echo "  -h, --help              Show this help message"
}

# Main script
case "$1" in
    "create:migration")
        create_migration "$2"
        ;;
    "migrate")
        run_migrations
        ;;
    "rollback")
        rollback_migrations
        ;;
    "create:seed")
        create_seed "$2"
        ;;
    "seed")
        run_seeds
        ;;
    "reset")
        rollback_migrations
        run_migrations
        ;;
    "fresh")
        print_warning "This will drop all tables. Are you sure? (y/n)"
        read -r CONFIRM
        if [ "$CONFIRM" = "y" ]; then
            # Add your reset code here
            run_migrations
            run_seeds
        fi
        ;;
    "status")
        check_env
        # Add your status check code here
        ;;
    "-h"|"--help"|"")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
