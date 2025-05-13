import {
  Controller,
  Get,
  Query,
  Param,
  ParseArrayPipe,
  Delete,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { StockService } from '../services/stock.service';
import { ChartMarketParams } from '../stock.types';
import { ApiResponse } from '../../common/dto/api-response.dto';

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

  @Post('prices')
  async getPriceBoard(@Body() params: { symbols: string[] }) {
    return this.stockService.getPriceBoard(params.symbols);
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

  @Get('financial')
  async GetFinancial(
    @Query('symbol') symbol: string,
    @Query('period') period: 'year' | 'quarter' = 'quarter',
  ) {
    try {
      if (!symbol) {
        throw new HttpException(
          'Symbol parameter is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = await this.stockService.getBalanceSheetBySymbol(
        symbol,
        period,
      );
      return ApiResponse.success(
        data,
        `Financial data for ${symbol} retrieved successfully`,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to retrieve financial data: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
