# Base image for Node.js
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port Vite will run on
EXPOSE 5173

# Command to start the server (adjust if needed)
CMD ["npm", "run", "dev"]

# Expose the application port
EXPOSE 3001

# Start the server
CMD ["node", "server.js"]
