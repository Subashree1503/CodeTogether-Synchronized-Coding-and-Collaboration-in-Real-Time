# Build stage: Use Node.js for building the application
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json first to leverage Docker cache for dependencies
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the application (ensure the build output is in /app/dist or adjust the path accordingly)
RUN npm run build

# Production stage: Use Nginx for serving static files
FROM nginx:alpine

# Copy built files from the build stage to Nginx's web directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for the server
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
