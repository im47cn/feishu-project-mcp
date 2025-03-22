# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Copy environment template
COPY .env.production.template .env.production

# Create necessary directories
RUN mkdir -p /var/lib/feishu-project-mcp/storage \
    && mkdir -p /var/log/feishu-project-mcp \
    && chown -R node:node /var/lib/feishu-project-mcp \
    && chown -R node:node /var/log/feishu-project-mcp

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start the service
CMD ["node", "dist/index.js"]
