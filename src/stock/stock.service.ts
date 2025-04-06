import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Vnstock } from 'vnstock-js';
import { RawHistoryEntry, ReadableHistoryEntry, StockHistoryParams } from './stock.types';

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);
  private readonly vnstock: any;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    const { stock } = new Vnstock();
    this.vnstock = stock;
  }

  /**
   * Get stock history data with caching
   */
  async getStockHistory(
    symbols: string[],
    startDate: string,
    endDate?: string,
  ): Promise<ReadableHistoryEntry[][]> {
    const cacheKey = `stock_history_${symbols.join('_')}_${startDate}_${endDate || ''}`;
    
    // Try to get from cache first
    const cachedData = await this.cacheManager.get<ReadableHistoryEntry[][]>(cacheKey);
    if (cachedData) {
      this.logger.log(`Retrieved stock history from cache for ${symbols.join(', ')}`);
      return cachedData;
    }

    try {
      // Get data from API if not in cache
      const params: StockHistoryParams = {
        symbols,
        start: startDate,
      };
      
      if (endDate) {
        params.end = endDate;
      }

      const rawHistory: any = await this.vnstock.quote.history(params);
      
      // Process the raw history data
      const readableHistory = rawHistory.map(entry => {
        const processedEntries: ReadableHistoryEntry[] = [];
        if (entry.t && entry.t.length > 0) {
          for (let i = 0; i < entry.t.length; i++) {
            // Convert Unix timestamp (seconds) to milliseconds for Date constructor
            const timestampMs = parseInt(entry.t[i], 10) * 1000;
            const date = new Date(timestampMs);

            processedEntries.push({
              // Format date as YYYY-MM-DD
              date: date.toISOString().split('T')[0],
              open: entry.o[i],
              high: entry.h[i],
              low: entry.l[i],
              close: entry.c[i],
              volume: entry.v[i],
            });
          }
        }
        // Sort by date ascending
        processedEntries.sort((a, b) => a.date.localeCompare(b.date));
        return processedEntries;
      });

      // Cache the processed data
      await this.cacheManager.set(cacheKey, readableHistory, 3600000); // Cache for 1 hour
      
      return readableHistory;
    } catch (error) {
      this.logger.error(`Failed to fetch stock history data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all available stock symbols
   */
  async getAllSymbols() {
    const cacheKey = 'all_stock_symbols';
    
    // Try to get from cache first
    const cachedSymbols = await this.cacheManager.get(cacheKey);
    if (cachedSymbols) {
      return cachedSymbols;
    }

    try {
      const allSymbols = await this.vnstock.listing.allSymbols();
      
      // Cache for 24 hours as this list doesn't change often
      await this.cacheManager.set(cacheKey, allSymbols, 86400000);
      
      return allSymbols;
    } catch (error) {
      this.logger.error(`Failed to fetch stock symbols: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get current price board for symbols
   */
  async getPriceBoard(symbols: string[]) {
    const cacheKey = `price_board_${symbols.join('_')}`;
    
    // Try to get from cache first - short TTL for price data
    const cachedPrices = await this.cacheManager.get(cacheKey);
    if (cachedPrices) {
      return cachedPrices;
    }

    try {
      const priceData = await this.vnstock.trading.priceBoard(symbols);
      
      // Cache for a short period (5 minutes) as prices change frequently
      await this.cacheManager.set(cacheKey, priceData, 300000);
      
      return priceData;
    } catch (error) {
      this.logger.error(`Failed to fetch price board: ${error.message}`);
      throw error;
    }
  }
} 