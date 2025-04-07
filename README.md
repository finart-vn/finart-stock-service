# FiNart - Financial Art

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A Vietnamese Stock Trading Advisory System built with NestJS.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

FiNart is a Vietnamese stock trading advisory system built with NestJS. It provides real-time data and trading insights for the Vietnamese stock market.

## Redis Cache Integration

This project uses Redis for caching stock data to improve performance and reduce API calls. Here's how it's set up:

### Configuration

Redis is configured in `src/config/redis.config.ts` and used as the global cache provider in `app.module.ts`. The cache is used for:

- Stock history data (TTL: 1 hour)
- Stock symbols (TTL: 24 hours)
- Price board data (TTL: 5 minutes)

### Environment Variables

Set the following environment variables to configure Redis:

```bash
REDIS_HOST=localhost  # Redis server host
REDIS_PORT=6379       # Redis server port
```

### Running with Docker

Use Docker Compose to run the application with Redis:

```bash
docker-compose up
```

### Cache Management API

Cache can be manually cleared using the following API endpoint:

```
DELETE /api/stock/cache/:type?symbols=sym1,sym2

# Where :type is one of: history, symbols, prices, all
# Optional symbols parameter for specific stock symbols
```

## Project setup

```bash
$ npm install
```

## Environment Variables

FiNart uses environment variables for configuration. A sample file `.env.sample` is provided as a template:

1. Copy the sample file to create your local environment file:

```bash
cp .env.sample .env
```

2. Edit the `.env` file and replace placeholder values with your actual configuration:

```
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication
JWT_SECRET=your_jwt_secret_key_here

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Note:** The `.env` file contains sensitive information and should never be committed to version control.

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).