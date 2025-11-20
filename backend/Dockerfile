# Use Node.js 18 LTS as base image
FROM node:18-alpine

# Set user to root as requested
USER root

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create directory for database
RUN mkdir -p /app/data

# Set environment variables
ENV NODE_ENV=production
ENV DB_PATH=/app/data/database.sqlite
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "src/index.js"]