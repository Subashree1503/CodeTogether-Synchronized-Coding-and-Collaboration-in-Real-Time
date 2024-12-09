FROM node:18-alpine
RUN apk add --no-cache redis
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install redis
RUN npm install
COPY . .
EXPOSE 3500
CMD ["node", "server.js"]
