import { Controller, Get, Query, Param, ParseArrayPipe } from '@nestjs/common';
import { StockService } from './stock.service';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('history')
  async getStockHistory(
    @Query('symbols', new ParseArrayPipe({ items: String, separator: ',' })) symbols: string[],
    @Query('startDate') startDate: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.stockService.getStockHistory(symbols, startDate, endDate);
  }

  @Get('symbols')
  async getAllSymbols() {
    return this.stockService.getAllSymbols();
  }

  @Get('prices')
  async getPriceBoard(
    @Query('symbols', new ParseArrayPipe({ items: String, separator: ',' })) symbols: string[],
  ) {
    return this.stockService.getPriceBoard(symbols);
  }
} 