# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src/ ./src/

# Build TypeScript code
RUN npm run build

# Runtime stage
FROM node:20-slim

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built JavaScript files from builder
COPY --from=builder /app/build ./build

# Make the entry point executable
RUN chmod +x build/index.js

# Run as non-root user for security
USER node

# Command to run the MCP server
CMD ["node", "build/index.js"]
