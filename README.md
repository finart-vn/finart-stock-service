# FiNart - Financial Art 📈

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

<p align="center">A Vietnamese Stock Trading Advisory System built with NestJS</p>

<p align="center">
  <a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
</p>

## 🚀 Overview

FiNart is a comprehensive Vietnamese stock trading advisory system that provides real-time market data, analysis, and trading insights for the Vietnamese stock market (VN-Index). Built with modern technologies including NestJS, PostgreSQL, Redis, and Prisma.

## ✨ Features

- 📊 Real-time Vietnamese stock market data
- 💾 Redis caching for improved performance
- 🔐 User authentication and authorization
- 📋 Personal stock watchlists (boards)
- 🏗️ RESTful API with Swagger documentation
- 🐳 Docker containerization
- 🗄️ PostgreSQL database with Prisma ORM
- ⚡ High-performance caching layer

## 🛠️ Technology Stack

- **Backend Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache**: Redis
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose
- **Language**: TypeScript
- **Package Manager**: npm

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v18 or higher)
- npm
- PostgreSQL
- Redis (optional - can use Docker)
- Docker & Docker Compose (for containerized deployment)

## 🏗️ Project Structure

```
finart-stock-api/
├── src/
│   ├── common/          # Shared utilities and decorators
│   ├── config/          # Configuration files
│   ├── market/          # Market data modules
│   ├── stock/           # Stock-related endpoints
│   ├── users/           # User management
│   ├── prisma/          # Database service
│   └── main.ts          # Application entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── seed.ts          # Database seeding
│   └── migrations/      # Database migrations
├── test/                # E2E tests
├── docker-compose.yml   # Docker services configuration
├── Dockerfile          # Application container
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd finart-stock-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the sample environment file and configure it:

```bash
cp .env.sample .env
```

Edit `.env` with your configuration:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/finart_db"

# Authentication
JWT_SECRET="your_super_secure_jwt_secret_here"

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Application
PORT=3001
NODE_ENV=development
```

### 4. Database Setup

Generate Prisma client and run migrations:

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate:dev

# Seed the database (optional)
npm run prisma:seed
```

### 5. Start the application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

The application will be available at `http://localhost:3001`

## 🐳 Docker Deployment

### Quick Start with Docker Compose

```bash
# Start all services (app + PostgreSQL + Redis)
npm run docker:dev

# Start in detached mode
npm run docker:start

# View logs
npm run docker:logs

# Stop all services
npm run docker:stop
```

### Manual Docker Build

```bash
# Build the Docker image
npm run docker:build

# Run with custom environment
docker run -p 3001:3001 \
  -e DATABASE_URL="postgresql://user:password@host:5432/db" \
  -e REDIS_HOST="redis-host" \
  finart-server
```

## 🚀 API Documentation

Once the application is running, you can access:

- **API Documentation**: `http://localhost:3001/api`
- **Health Check**: `http://localhost:3001/`

### Key API Endpoints

- `GET /api/stock` - Get stock data
- `GET /api/market` - Market information
- `POST /auth/login` - User authentication
- `GET /users/boards` - User watchlists
- `DELETE /api/stock/cache/:type` - Cache management

## 💾 Redis Cache Integration

The application uses Redis for caching to improve performance:

### Cache Configuration

- **Stock history data**: TTL 1 hour
- **Stock symbols**: TTL 24 hours  
- **Price board data**: TTL 5 minutes

### Cache Management

```bash
# Clear specific cache type
DELETE /api/stock/cache/history
DELETE /api/stock/cache/symbols  
DELETE /api/stock/cache/prices

# Clear all caches
DELETE /api/stock/cache/all

# Clear specific symbols
DELETE /api/stock/cache/history?symbols=VIC,VCB,FPT
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: User accounts and authentication
- **Boards**: Personal stock watchlists/portfolios

```prisma
model User {
  id           String @id @default(uuid())
  email        String @unique
  name         String
  passwordHash String
  passwordSalt String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  Board        Board[]
}

model Board {
  id        String   @id @default(uuid())
  name      String
  owner     User     @relation(fields: [ownerId], references: [id])
  ownerId   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run e2e tests
npm run test:e2e

# Generate test coverage
npm run test:cov

# Debug tests
npm run test:debug
```

## 📊 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Start the application |
| `npm run start:dev` | Start in development mode with hot reload |
| `npm run start:prod` | Start in production mode |
| `npm run build` | Build the application |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate:dev` | Run database migrations |
| `npm run docker:build` | Build Docker image |
| `npm run docker:start` | Start with Docker Compose |

## 🚀 Deployment

### Production Deployment

1. **Environment Variables**: Set production environment variables
2. **Database**: Ensure PostgreSQL is available
3. **Redis**: Configure Redis for caching
4. **Build**: Run `npm run build`
5. **Start**: Run `npm run start:prod`

### Railway Deployment

The project includes Railway-specific scripts:

```bash
npm run railway:build
npm run railway:start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under UNLICENSED - see the package.json file for details.

## 🆘 Support

For questions and support:

- Create an issue in the repository
- Check the [NestJS Documentation](https://docs.nestjs.com)
- Visit the [NestJS Discord](https://discord.gg/G7Qnnhy)

---

<p align="center">Built with ❤️ using NestJS</p>