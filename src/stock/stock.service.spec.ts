import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { StockService } from './stock.service';
import { ReadableHistoryEntry } from './stock.types';
import { Logger } from '@nestjs/common';

// Mock data
const mockHistoryData = [
  [
    {
      date: '2023-01-01',
      open: 100,
      high: 105,
      low: 98,
      close: 102,
      volume: 1000000
    },
    {
      date: '2023-01-02',
      open: 102,
      high: 107,
      low: 101,
      close: 106,
      volume: 1200000
    }
  ]
];

const mockSymbols = [
  { symbol: 'VNM', companyName: 'Vietnam Dairy Products JSC' },
  { symbol: 'VHM', companyName: 'Vinhomes JSC' }
];

const mockPriceBoard = [
  {
    symbol: 'VNM',
    price: 80000,
    change: 1000,
    pctChange: 1.25
  }
];

const mockRawHistoryData = [
  {
    symbol: 'VNM',
    o: [100, 102],
    h: [105, 107],
    l: [98, 101],
    c: [102, 106],
    v: [1000000, 1200000],
    t: ['1672531200', '1672617600'], // Unix timestamps for '2023-01-01' and '2023-01-02'
    accumulatedVolume: [1000000, 2200000],
    accumulatedValue: [102000000, 217200000],
    minBatchTruncTime: '1672531200'
  }
];

// Mock VNStock interface
const mockVnstock = {
  stock: {
    quote: {
      history: jest.fn().mockResolvedValue(mockRawHistoryData)
    },
    listing: {
      allSymbols: jest.fn().mockResolvedValue(mockSymbols)
    },
    trading: {
      priceBoard: jest.fn().mockResolvedValue(mockPriceBoard)
    }
  }
};

// Mock the entire Vnstock class
jest.mock('vnstock-js', () => {
  return {
    Vnstock: jest.fn().mockImplementation(() => mockVnstock)
  };
});

describe('StockService', () => {
  let service: StockService;
  let mockCacheManager: any;

  beforeEach(async () => {
    // Create a mock cache manager
    mockCacheManager = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined)
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager
        }
      ],
    }).compile();

    service = module.get<StockService>(StockService);
    // Mock the logger to avoid console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStockHistory', () => {
    const params = {
      symbols: ['VNM'],
      startDate: '2023-01-01',
      endDate: '2023-01-02'
    };

    it('should return cached data when available', async () => {
      mockCacheManager.get.mockResolvedValue(mockHistoryData);
      
      const result = await service.getStockHistory(
        params.symbols,
        params.startDate,
        params.endDate
      );
      
      expect(result).toEqual(mockHistoryData);
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        `stock_history_${params.symbols.join('_')}_${params.startDate}_${params.endDate}`
      );
    });

    it('should fetch and process data when cache is empty', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      
      const result = await service.getStockHistory(
        params.symbols,
        params.startDate,
        params.endDate
      );
      
      expect(mockCacheManager.get).toHaveBeenCalled();
      expect(result).toHaveLength(1); // One entry per symbol
      expect(result[0]).toHaveLength(2); // Two days of data
      
      // Verify data processing
      expect(result[0][0].date).toBe('2023-01-01');
      expect(result[0][0].open).toBe(100);
      expect(result[0][0].high).toBe(105);
      expect(result[0][0].low).toBe(98);
      expect(result[0][0].close).toBe(102);
      expect(result[0][0].volume).toBe(1000000);
      
      // Verify cache was set
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        `stock_history_${params.symbols.join('_')}_${params.startDate}_${params.endDate}`,
        expect.any(Array),
        3600000
      );
    });

    it('should handle API errors', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      const mockError = new Error('API error');
      
      // Mock the API call to throw an error
      mockVnstock.stock.quote.history.mockRejectedValueOnce(mockError);
      
      await expect(
        service.getStockHistory(params.symbols, params.startDate, params.endDate)
      ).rejects.toThrow('API error');
      
      expect(Logger.prototype.error).toHaveBeenCalled();
    });
  });

  describe('getAllSymbols', () => {
    it('should return cached symbols when available', async () => {
      mockCacheManager.get.mockResolvedValue(mockSymbols);
      
      const result = await service.getAllSymbols();
      
      expect(result).toEqual(mockSymbols);
      expect(mockCacheManager.get).toHaveBeenCalledWith('all_stock_symbols');
      expect(mockVnstock.stock.listing.allSymbols).not.toHaveBeenCalled();
    });

    it('should fetch symbols when cache is empty', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      
      const result = await service.getAllSymbols();
      
      expect(result).toEqual(mockSymbols);
      expect(mockCacheManager.get).toHaveBeenCalledWith('all_stock_symbols');
      expect(mockVnstock.stock.listing.allSymbols).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'all_stock_symbols',
        mockSymbols,
        86400000
      );
    });

    it('should handle API errors', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      const mockError = new Error('API error');
      
      mockVnstock.stock.listing.allSymbols.mockRejectedValueOnce(mockError);
      
      await expect(service.getAllSymbols()).rejects.toThrow('API error');
      expect(Logger.prototype.error).toHaveBeenCalled();
    });
  });

  describe('getPriceBoard', () => {
    const symbols = ['VNM'];

    it('should return cached price data when available', async () => {
      mockCacheManager.get.mockResolvedValue(mockPriceBoard);
      
      const result = await service.getPriceBoard(symbols);
      
      expect(result).toEqual(mockPriceBoard);
      expect(mockCacheManager.get).toHaveBeenCalledWith(`price_board_${symbols.join('_')}`);
      expect(mockVnstock.stock.trading.priceBoard).not.toHaveBeenCalled();
    });

    it('should fetch price data when cache is empty', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      
      const result = await service.getPriceBoard(symbols);
      
      expect(result).toEqual(mockPriceBoard);
      expect(mockCacheManager.get).toHaveBeenCalledWith(`price_board_${symbols.join('_')}`);
      expect(mockVnstock.stock.trading.priceBoard).toHaveBeenCalledWith(symbols);
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        `price_board_${symbols.join('_')}`,
        mockPriceBoard,
        300000
      );
    });

    it('should handle API errors', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      const mockError = new Error('API error');
      
      mockVnstock.stock.trading.priceBoard.mockRejectedValueOnce(mockError);
      
      await expect(service.getPriceBoard(symbols)).rejects.toThrow('API error');
      expect(Logger.prototype.error).toHaveBeenCalled();
    });
  });
}); 