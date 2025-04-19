import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { StockService } from './services/stock.service';
import { StockController } from './controllers/stock.controller';
import { VciExtendService } from './services/vci-extend.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 20, // 20 requests per minute
    }]),
  ],
  controllers: [StockController],
  providers: [
    StockService,
    VciExtendService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [StockService, VciExtendService],
})
export class StockModule {} 