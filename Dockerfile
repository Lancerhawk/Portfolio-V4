# Use Node 20
FROM node:20-slim

# Create app directory
WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy server package files
COPY server/package*.json ./server/

# Install root and server dependencies
RUN npm install
RUN cd server && npm install

# Copy application source
COPY server/ ./server/
COPY src/data/portfolio.json ./src/data/portfolio.json

# Environment variables
ENV NODE_ENV=production
ENV AI_SERVER_PORT=3001

# Start the server using the root script
CMD ["npm", "run", "server"]
