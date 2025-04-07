import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { APP_CONFIG, getAppNameAndVersion } from './config/app.config';

async function bootstrap() {
  const logger = new Logger(APP_CONFIG.NAME);
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix(APP_CONFIG.API_PREFIX);
  
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  
  logger.log(`🚀 ${getAppNameAndVersion()} is running on http://localhost:${port}/${APP_CONFIG.API_PREFIX}`);
}
bootstrap();
