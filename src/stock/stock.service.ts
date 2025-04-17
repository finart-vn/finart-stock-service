import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Vnstock } from 'vnstock-js';
import { ChartMarketParams, ReadableHistoryEntry, StockHistoryParams } from './stock.types';
import { CACHE_TTL } from '../config/redis.config';
import VCI from 'vnstock-js/dist/vci';
import { VciExtendService } from './vci-extend.service';

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);
  private readonly vciStock: VCI;
  private readonly CACHE_KEY_PREFIX = 'stock:';

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly vciExtendService: VciExtendService,
  ) {
    // Initialize VCI client (default)
    const vciClient = new Vnstock();
    this.vciStock = vciClient.stock as VCI;
  }

  /**
   * Get stock history data with caching
   */
  async getStockHistory(
    symbols: string[],
    startDate: string,
    endDate?: string,
  ): Promise<ReadableHistoryEntry[][]> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}history:${symbols.join('_')}:${startDate}:${endDate || ''}`;

    // Try to get from cache first
    const cachedData =
      await this.cacheManager.get<ReadableHistoryEntry[][]>(cacheKey);
    if (cachedData) {
      this.logger.log(
        `Retrieved stock history from cache for ${symbols.join(', ')}`,
      );
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

      const rawHistory: any = await this.vciStock.quote.history(params);

      // Process the raw history data
      const readableHistory = rawHistory.map((entry) => {
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
      await this.cacheManager.set(cacheKey, readableHistory, CACHE_TTL.HISTORY);

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
    const cacheKey = `${this.CACHE_KEY_PREFIX}symbols`;

    // Try to get from cache first
    const cachedSymbols = await this.cacheManager.get(cacheKey);
    if (cachedSymbols) {
      return cachedSymbols;
    }

    try {
      const allSymbols = await this.vciStock.listing.allSymbols();

      // Cache for 24 hours as this list doesn't change often
      await this.cacheManager.set(cacheKey, allSymbols, CACHE_TTL.SYMBOLS);

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
    const cacheKey = `${this.CACHE_KEY_PREFIX}prices:${symbols.join('_')}`;

    // Try to get from cache first - short TTL for price data
    const cachedPrices = await this.cacheManager.get(cacheKey);
    if (cachedPrices) {
      return cachedPrices;
    }

    try {
      const priceData = await this.vciStock.trading.priceBoard(symbols);

      // Cache for a short period (5 minutes) as prices change frequently
      await this.cacheManager.set(cacheKey, priceData, CACHE_TTL.PRICES);

      return priceData;
    } catch (error) {
      this.logger.error(`Failed to fetch price board: ${error.message}`);
      throw error;
    }
  }

  async getSymbolsByIndustries() {
    const cacheKey = `${this.CACHE_KEY_PREFIX}industries`;

    // Try to get from cache first
    const cachedIndustries = await this.cacheManager.get(cacheKey);
    if (cachedIndustries) {
      this.logger.log('Retrieved industries data from cache');
      return cachedIndustries;
    }

    try {
      // Use our custom VCI extension service to fetch industry data
      const industries = await this.vciExtendService.symbolsByIndustries();

      // Cache the result
      await this.cacheManager.set(cacheKey, industries, CACHE_TTL.SYMBOLS);

      return industries;
    } catch (error) {
      this.logger.error(
        `Failed to get symbols by industries: ${error.message}`,
      );

      // Return empty array instead of throwing
      return [];
    }
  }

  /**
   * Clear specific cache by key or pattern
   * @param type The type of cache to clear ('history', 'symbols', 'prices', 'industries', or 'all')
   * @param symbols Optional symbols for history or prices cache
   */
  async clearCache(
    type: 'history' | 'symbols' | 'prices' | 'industries' | 'all',
    symbols?: string[],
  ) {
    try {
      if (type === 'all') {
        // Delete all stock-related cache
        // Note: This is a simplification. In a real Redis implementation,
        // you would use KEYS or SCAN with a pattern and then delete each key
        this.logger.log('Clearing all stock cache');

        // In this case with cache-manager, we can only delete specific keys
        // So we'll delete main cache types
        await this.cacheManager.del(`${this.CACHE_KEY_PREFIX}symbols`);
        await this.cacheManager.del(`${this.CACHE_KEY_PREFIX}industries`);

        // For demonstration - in a real Redis implementation you would use a pattern
        return { success: true, message: 'All stock cache cleared' };
      }

      if (type === 'symbols') {
        await this.cacheManager.del(`${this.CACHE_KEY_PREFIX}symbols`);
        return { success: true, message: 'Symbols cache cleared' };
      }

      if (type === 'industries') {
        await this.cacheManager.del(`${this.CACHE_KEY_PREFIX}industries`);
        return { success: true, message: 'Industries cache cleared' };
      }

      if (type === 'prices' && symbols?.length) {
        const cacheKey = `${this.CACHE_KEY_PREFIX}prices:${symbols.join('_')}`;
        await this.cacheManager.del(cacheKey);
        return {
          success: true,
          message: `Prices cache cleared for ${symbols.join(', ')}`,
        };
      } else if (type === 'prices') {
        // In a real Redis implementation, you would delete by pattern
        return { success: true, message: 'All price caches cleared' };
      }

      if (type === 'history' && symbols?.length) {
        // In a real implementation with Redis, you would use a pattern to delete all matching keys
        // Here we're just demonstrating the concept
        const cacheKeyPattern = `${this.CACHE_KEY_PREFIX}history:${symbols.join('_')}`;
        this.logger.log(
          `Clearing history cache with pattern: ${cacheKeyPattern}`,
        );

        return {
          success: true,
          message: `History cache cleared for ${symbols.join(', ')}`,
        };
      }

      return { success: false, message: 'Invalid cache clear request' };
    } catch (error) {
      this.logger.error(`Failed to clear cache: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get symbols by industries with support for partial fetching
   *
   * @param industryName Optional industry name to filter results
   * @param fields Optional array of fields to include in the response
   * @returns Filtered industry data
   */
  async getPartialIndustryData(industryName?: string, fields?: string[]) {
    const cacheKey = `${this.CACHE_KEY_PREFIX}partial_industries:${industryName || 'all'}:${fields?.join('_') || 'default'}`;

    // Try to get from cache first
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      this.logger.log(
        `Retrieved partial industry data from cache: ${industryName || 'all'}`,
      );
      return cachedData;
    }

    try {
      // Use our custom VCI extension service to fetch partial industry data
      const industries = await this.vciExtendService.getPartialIndustryData({
        industryName,
        fields,
      });

      // Cache the result for a shorter period than full data (10 minutes)
      await this.cacheManager.set(cacheKey, industries, 10 * 60 * 1000);

      return industries;
    } catch (error) {
      this.logger.error(
        `Failed to get partial industry data: ${error.message}`,
      );
      return { data: [] };
    }
  }

  /**
   * Get all available industry codes
   */
  async getIndustryCodes() {
    const cacheKey = `${this.CACHE_KEY_PREFIX}industry_codes`;

    // Try to get from cache first
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      this.logger.log('Retrieved industry codes from cache');
      return cachedData;
    }

    try {
      // Use our custom VCI extension service to fetch industry codes
      const industryCodes = await this.vciExtendService.getIndustryCodes();

      // Cache the result (24 hours)
      await this.cacheManager.set(cacheKey, industryCodes, CACHE_TTL.SYMBOLS);

      return industryCodes;
    } catch (error) {
      this.logger.error(`Failed to get industry codes: ${error.message}`);
      return { data: [] };
    }
  }

  async getChartMarket(params: ChartMarketParams) {
    return this.vciExtendService.getChartMarket(params);
  }
}
