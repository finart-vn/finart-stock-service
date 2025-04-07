FROM node:18-alpine

WORKDIR /usr/src/app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Explicitly set Prisma variables
ENV PRISMA_QUERY_ENGINE_TYPE=binary
ENV PRISMA_CLIENT_ENGINE_TYPE=binary

# Generate Prisma client and ensure it's properly initialized
RUN npx prisma generate && \
    npx prisma db push --accept-data-loss

# Build the application and ensure main.js is created
RUN npm run build && ls -la dist/

# Expose the application port
EXPOSE 3001

# Start the application directly
CMD ["node", "dist/src/main.js"] 