FROM node:18-alpine As development

# Create app directory
WORKDIR /usr/src/app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl1.1-compat

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

FROM node:18-alpine As production

# Set node environment to production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Create app directory
WORKDIR /usr/src/app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl1.1-compat

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy build artifacts
COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

# Copy environment files and startup script
COPY .env* ./
COPY docker-start.sh ./
RUN chmod +x docker-start.sh

# Expose the application port
EXPOSE 3001

# Start the application with our script
CMD ["./docker-start.sh"] 