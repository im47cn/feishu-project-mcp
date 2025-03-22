# Variables
SHELL := /bin/bash
NODE_ENV ?= development
DOCKER_COMPOSE := docker-compose

# Make scripts executable
init:
	@chmod +x scripts/*.sh

# Install dependencies
install:
	@npm install

# Development commands
dev:
	@npm run dev

dev-docker:
	@$(DOCKER_COMPOSE) up dev

# Build commands
build:
	@npm run build

build-docker:
	@$(DOCKER_COMPOSE) build

# Test commands
test:
	@npm test

test-watch:
	@npm test -- --watch

test-coverage:
	@npm test -- --coverage

test-docker:
	@./scripts/test-docker.sh

# Lint commands
lint:
	@npm run lint

lint-fix:
	@npm run lint -- --fix

# Format commands
format:
	@npm run format

# Clean commands
clean:
	@rm -rf dist coverage
	@rm -rf test-storage/* test-logs/*
	@rm -rf node_modules
	@docker-compose down -v || true

# Docker commands
up:
	@./scripts/deploy.sh

down:
	@$(DOCKER_COMPOSE) down

logs:
	@$(DOCKER_COMPOSE) logs -f

# Setup commands
setup: init
	@./scripts/setup.sh

# Help command
help:
	@echo "Available commands:"
	@echo "  make init          - Make scripts executable"
	@echo "  make install      - Install dependencies"
	@echo "  make dev          - Start development server"
	@echo "  make dev-docker   - Start development server in Docker"
	@echo "  make build        - Build the project"
	@echo "  make build-docker - Build Docker images"
	@echo "  make test         - Run tests"
	@echo "  make test-watch   - Run tests in watch mode"
	@echo "  make test-coverage- Run tests with coverage"
	@echo "  make test-docker  - Run tests in Docker"
	@echo "  make lint         - Run linter"
	@echo "  make lint-fix     - Run linter and fix issues"
	@echo "  make format       - Format code"
	@echo "  make clean        - Clean build artifacts"
	@echo "  make up           - Start Docker containers"
	@echo "  make down         - Stop Docker containers"
	@echo "  make logs         - Show Docker container logs"
	@echo "  make setup        - Initial project setup"
	@echo "  make help         - Show this help message"

.PHONY: init install dev dev-docker build build-docker test test-watch test-coverage \
        test-docker lint lint-fix format clean up down logs setup help