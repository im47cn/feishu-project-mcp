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

# Check if version is provided
if [ -z "$1" ]; then
    print_error "Please provide a version number (e.g., 1.0.0)"
    exit 1
fi

VERSION=$1

# Validate version format
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    print_error "Invalid version format. Please use semantic versioning (e.g., 1.0.0)"
    exit 1
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    print_error "Working directory is not clean. Please commit or stash changes."
    exit 1
fi

# Check if on main branch
CURRENT_BRANCH=$(git symbolic-ref --short HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_error "Not on main branch. Please switch to main branch."
    exit 1
fi

# Pull latest changes
print_status "Pulling latest changes..."
git pull origin main

# Run tests
print_status "Running tests..."
npm test

# Update version
print_status "Updating version to $VERSION..."
npm version $VERSION --no-git-tag-version

# Update CHANGELOG.md
print_status "Updating CHANGELOG.md..."
TODAY=$(date +%Y-%m-%d)
sed -i "" "s/\[Unreleased\]/\[Unreleased\]\n\n## [$VERSION] - $TODAY/" CHANGELOG.md

# Build project
print_status "Building project..."
npm run build

# Create git tag
print_status "Creating git tag..."
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore: release version $VERSION"
git tag -a "v$VERSION" -m "Release version $VERSION"

# Build Docker image
print_status "Building Docker image..."
docker build -t "feishu-project-mcp:$VERSION" -t "feishu-project-mcp:latest" .

# Push changes
print_status "Pushing changes..."
git push origin main
git push origin "v$VERSION"

# Push Docker image
print_status "Do you want to push the Docker image? (y/n)"
read -r PUSH_DOCKER
if [ "$PUSH_DOCKER" = "y" ]; then
    print_status "Pushing Docker image..."
    docker push "feishu-project-mcp:$VERSION"
    docker push "feishu-project-mcp:latest"
fi

# Create GitHub release
print_status "Creating GitHub release..."
if command -v gh &> /dev/null; then
    CHANGELOG_SECTION=$(awk "/## \[$VERSION\]/,/## \[/" CHANGELOG.md | head -n -1)
    gh release create "v$VERSION" \
        --title "Release v$VERSION" \
        --notes "$CHANGELOG_SECTION" \
        ./dist/*.js
else
    print_warning "GitHub CLI not found. Please create the release manually."
fi

print_status "Release v$VERSION completed successfully!"
print_status "Next steps:"
echo "1. Update documentation if needed"
echo "2. Notify users of the new release"
echo "3. Monitor for any issues"

# Cleanup
print_status "Cleaning up..."
rm -rf dist/

print_status "Done! 🎉"
