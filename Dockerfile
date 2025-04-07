FROM node:18-alpine

WORKDIR /usr/src/app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Set environment variables for build time
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
ENV PRISMA_QUERY_ENGINE_TYPE=binary
ENV PRISMA_CLIENT_ENGINE_TYPE=binary

# Generate Prisma client and push schema
RUN npx prisma generate && npx prisma db push --accept-data-loss

# Build the application
RUN npm run build

# Expose the application port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start:prod"] 