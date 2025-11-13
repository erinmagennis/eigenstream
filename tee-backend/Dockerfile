FROM node:20-slim

# Install FFmpeg and dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Create storage directories
RUN mkdir -p /tmp/eigenstream/videos /tmp/eigenstream/analysis

# Expose ports
# 8000 - API server
# 1935 - RTMP stream port
EXPOSE 8000 1935

# Start the server
CMD ["npm", "start"]
