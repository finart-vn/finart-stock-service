import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { APP_CONFIG, getAppNameAndVersion } from './config/app.config';

async function bootstrap() {
  const logger = new Logger(APP_CONFIG.NAME);
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });
  
  app.setGlobalPrefix(APP_CONFIG.API_PREFIX);
  
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  
  logger.log(`🚀 ${getAppNameAndVersion()} is running on http://localhost:${port}/${APP_CONFIG.API_PREFIX}`);
}
bootstrap();
