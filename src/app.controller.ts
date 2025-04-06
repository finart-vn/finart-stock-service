import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { StockService } from './stock/stock.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly stockService: StockService,
  ) {}

  @Get()
  async getHello(): Promise<{
    history: any[];
    allSymbols: any;
  }> {
    const symbols = ['HPG'];
    const startDate = '2025-04-01';
    
    try {
      const readableHistory = await this.stockService.getStockHistory(symbols, startDate);
      return {
        history: readableHistory,
        allSymbols: [],
      };
    } catch (error) {
      throw error;
    }
  }
}
