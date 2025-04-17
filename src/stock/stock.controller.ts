import {
  Controller,
  Get,
  Query,
  Param,
  ParseArrayPipe,
  Delete,
  Post,
  Body,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { ChartMarketParams } from './stock.types';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('history')
  async getStockHistory(
    @Query('symbols', new ParseArrayPipe({ items: String, separator: ',' }))
    symbols: string[],
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
    @Query('symbols', new ParseArrayPipe({ items: String, separator: ',' }))
    symbols: string[],
  ) {
    return this.stockService.getPriceBoard(symbols);
  }

  /**
   * Get symbols grouped by industries
   * @returns An array of industry objects, each containing an array of symbols
   */
  @Get('industries')
  async getSymbolsByIndustries() {
    return this.stockService.getSymbolsByIndustries();
  }

  /**
   * Get partial industry data with optional filtering
   * @param industryName Optional industry name to filter by
   * @param fields Optional comma-separated list of fields to include
   * @returns Filtered industry data
   */
  @Get('industries/partial')
  async getPartialIndustryData(
    @Query('industryName') industryName?: string,
    @Query('fields') fieldsString?: string,
  ) {
    const fields = fieldsString ? fieldsString.split(',') : undefined;
    return this.stockService.getPartialIndustryData(industryName, fields);
  }

  /**
   * Get all industry codes
   * @returns List of all industry codes
   */
  @Get('industries/codes')
  async getIndustryCodes() {
    return this.stockService.getIndustryCodes();
  }

  @Post('chart/market')
  async getChartMarket(@Body() params: ChartMarketParams) {
    return this.stockService.getChartMarket({
      symbols: params.symbols,
      fromDate: params.fromDate,
      toDate: params.toDate,
    });
  }

  @Delete('cache/:type')
  async clearCache(
    @Param('type')
    type: 'history' | 'symbols' | 'prices' | 'industries' | 'all',
    @Query('symbols') symbolsString?: string,
  ) {
    const symbols = symbolsString ? symbolsString.split(',') : undefined;
    return this.stockService.clearCache(type, symbols);
  }
}
