# Multi-stage Dockerfile for React app using Vite

# Build stage
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy runtime environment script
COPY runtime-env.js /usr/share/nginx/html/runtime-env.js

# Inject the environment configuration script into index.html
RUN sed -i 's|<title>weather-app-react</title>|<title>weather-app-react</title><script src=\"/runtime-env.js\"></script><script src=\"/env-config.js\"></script>|' /usr/share/nginx/html/index.html

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy custom nginx configuration (optional, for SPA routing)
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Use custom entrypoint script
ENTRYPOINT ["/entrypoint.sh"]