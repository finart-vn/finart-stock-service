import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60 * 60 * 1000, // default cache TTL: 1 hour
      max: 100, // maximum number of items in cache
      isGlobal: false,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 20, // 20 requests per minute
    }]),
  ],
  controllers: [StockController],
  providers: [
    StockService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [StockService],
})
export class StockModule {} 