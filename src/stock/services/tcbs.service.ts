import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TcbsService {
  private readonly logger = new Logger(TcbsService.name);

  /**
   * Fetch symbols grouped by industries from TCBS APIs
   */
  async getSymbolsByIndustries() {
    try {
      // Get industry data from TCBS API
      const sectorResponse = await axios.get('https://apipubaws.tcbs.com.vn/tcanalysis/v1/industry');
      
      // Get all symbols
      const symbolsResponse = await axios.get('https://apipubaws.tcbs.com.vn/tcanalysis/v1/ticker');
      
      if (!symbolsResponse.data || !sectorResponse.data) {
        throw new Error('Invalid response format from TCBS API');
      }

      // Create a map of ticker to industry
      const industryMap = new Map();
      if (Array.isArray(sectorResponse.data)) {
        sectorResponse.data.forEach(sector => {
          if (sector.industryName && Array.isArray(sector.tickers)) {
            sector.tickers.forEach(ticker => {
              industryMap.set(ticker, sector.industryName);
            });
          }
        });
      }

      // Group symbols by industry
      const industriesMap = new Map();
      if (symbolsResponse.data.data && Array.isArray(symbolsResponse.data.data)) {
        symbolsResponse.data.data.forEach(item => {
          const industry = industryMap.get(item.ticker) || 'Uncategorized';
          
          if (!industriesMap.has(industry)) {
            industriesMap.set(industry, []);
          }
          
          industriesMap.get(industry).push({
            ticker: item.ticker,
            organName: item.organName,
            industry: industry
          });
        });
      }

      // Convert to array of industries
      const result = Array.from(industriesMap.entries()).map(([industry, symbols]) => ({
        industry,
        symbols
      }));

      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch industry data: ${error.message}`);
      if (error.response) {
        this.logger.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
      }
      return [];
    }
  }
} 