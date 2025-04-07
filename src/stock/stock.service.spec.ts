import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { StockService } from './stock.service';
import { Logger } from '@nestjs/common';
import { CACHE_TTL } from '../config/redis.config';
import { VciExtendService } from './vci-extend.service';

// Mock data
const mockHistoryData = [
  [
    {
      date: '2023-01-01',
      open: 100,
      high: 105,
      low: 98,
      close: 102,
      volume: 1000000,
    },
    {
      date: '2023-01-02',
      open: 102,
      high: 107,
      low: 101,
      close: 106,
      volume: 1200000,
    },
  ],
];

// Update the mockSymbols with the new format
const mockSymbols = {
  record_count: 2,
  ticker_info: [
    {
      ticker: 'VNM',
      organName: 'Vietnam Dairy Products JSC',
      industry: 'Food & Beverage',
    },
    { ticker: 'VHM', organName: 'Vinhomes JSC', industry: 'Real Estate' },
  ],
};

const mockPriceBoard = [
  {
    symbol: 'VNM',
    price: 80000,
    change: 1000,
    pctChange: 1.25,
  },
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
    minBatchTruncTime: '1672531200',
  },
];

// Update mockIndustriesData to match the new format
const mockIndustriesData = [
  {
    industry: 'Food & Beverage',
    symbols: [
      {
        ticker: 'VNM',
        organName: 'Vietnam Dairy Products JSC',
        industry: 'Food & Beverage',
      },
    ],
  },
  {
    industry: 'Real Estate',
    symbols: [
      { ticker: 'VHM', organName: 'Vinhomes JSC', industry: 'Real Estate' },
      { ticker: 'VIC', organName: 'Vingroup JSC', industry: 'Real Estate' },
    ],
  },
  {
    industry: 'Steel',
    symbols: [
      { ticker: 'HPG', organName: 'Hoa Phat Group', industry: 'Steel' },
    ],
  },
];

// Mock VNStock interface
const mockVnstock = {
  stock: {
    quote: {
      history: jest.fn().mockResolvedValue(mockRawHistoryData),
    },
    listing: {
      allSymbols: jest.fn().mockResolvedValue(mockSymbols),
      symbolsByIndustries: jest.fn().mockResolvedValue(mockIndustriesData),
    },
    trading: {
      priceBoard: jest.fn().mockResolvedValue(mockPriceBoard),
    },
  },
  vci: {
    listing: {
      symbolsByIndustries: jest.fn().mockResolvedValue(mockIndustriesData),
    },
  },
};

// Mock the entire Vnstock class
jest.mock('vnstock-js', () => {
  return {
    Vnstock: jest.fn().mockImplementation(() => mockVnstock),
  };
});

// Mock the VciExtendService
const mockVciExtendService = {
  symbolsByIndustries: jest.fn().mockResolvedValue(mockIndustriesData),
  getPartialIndustryData: jest.fn().mockResolvedValue({ data: [] }),
  getIndustryCodes: jest.fn().mockResolvedValue({ data: [] }),
};

describe('StockService', () => {
  let service: StockService;
  let mockCacheManager: any;

  beforeEach(async () => {
    // Create a mock cache manager
    mockCacheManager = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: VciExtendService,
          useValue: mockVciExtendService,
        },
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
      endDate: '2023-01-02',
    };

    it('should return cached data when available', async () => {
      mockCacheManager.get.mockResolvedValue(mockHistoryData);

      const result = await service.getStockHistory(
        params.symbols,
        params.startDate,
        params.endDate,
      );

      expect(result).toEqual(mockHistoryData);
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        `stock:history:${params.symbols.join('_')}:${params.startDate}:${params.endDate}`,
      );
    });

    it('should fetch and process data when cache is empty', async () => {
      mockCacheManager.get.mockResolvedValue(null);

      const result = await service.getStockHistory(
        params.symbols,
        params.startDate,
        params.endDate,
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
        `stock:history:${params.symbols.join('_')}:${params.startDate}:${params.endDate}`,
        expect.any(Array),
        CACHE_TTL.HISTORY,
      );
    });

    it('should handle API errors', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      const mockError = new Error('API error');

      // Mock the API call to throw an error
      mockVnstock.stock.quote.history.mockRejectedValueOnce(mockError);

      await expect(
        service.getStockHistory(
          params.symbols,
          params.startDate,
          params.endDate,
        ),
      ).rejects.toThrow('API error');

      expect(Logger.prototype.error).toHaveBeenCalled();
    });
  });

  describe('getAllSymbols', () => {
    it('should return cached symbols when available', async () => {
      mockCacheManager.get.mockResolvedValue(mockSymbols);

      const result = await service.getAllSymbols();

      expect(result).toEqual(mockSymbols);
      expect(mockCacheManager.get).toHaveBeenCalledWith('stock:symbols');
      expect(mockVnstock.stock.listing.allSymbols).not.toHaveBeenCalled();
    });

    it('should fetch symbols when cache is empty', async () => {
      mockCacheManager.get.mockResolvedValue(null);

      const result = await service.getAllSymbols();

      expect(result).toEqual(mockSymbols);
      expect(mockCacheManager.get).toHaveBeenCalledWith('stock:symbols');
      expect(mockVnstock.stock.listing.allSymbols).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'stock:symbols',
        mockSymbols,
        CACHE_TTL.SYMBOLS,
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
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        `stock:prices:${symbols.join('_')}`,
      );
      expect(mockVnstock.stock.trading.priceBoard).not.toHaveBeenCalled();
    });

    it('should fetch price data when cache is empty', async () => {
      mockCacheManager.get.mockResolvedValue(null);

      const result = await service.getPriceBoard(symbols);

      expect(result).toEqual(mockPriceBoard);
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        `stock:prices:${symbols.join('_')}`,
      );
      expect(mockVnstock.stock.trading.priceBoard).toHaveBeenCalledWith(
        symbols,
      );
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        `stock:prices:${symbols.join('_')}`,
        mockPriceBoard,
        CACHE_TTL.PRICES,
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

  describe('getSymbolsByIndustries', () => {
    it('should use vciExtendService and return industry data', async () => {
      mockCacheManager.get.mockResolvedValue(null);

      const result = await service.getSymbolsByIndustries();

      expect(result).toEqual(mockIndustriesData);
      expect(mockVciExtendService.symbolsByIndustries).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'stock:industries',
        mockIndustriesData,
        CACHE_TTL.SYMBOLS,
      );
    });

    it('should return cached industry data when available', async () => {
      mockCacheManager.get.mockResolvedValue(mockIndustriesData);

      const result = await service.getSymbolsByIndustries();

      expect(result).toEqual(mockIndustriesData);
      expect(mockCacheManager.get).toHaveBeenCalledWith('stock:industries');
      expect(mockVciExtendService.symbolsByIndustries).not.toHaveBeenCalled();
    });

    it('should handle errors and return empty array', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockVciExtendService.symbolsByIndustries.mockRejectedValueOnce(
        new Error('API error'),
      );

      const result = await service.getSymbolsByIndustries();

      expect(result).toEqual([]);
      expect(Logger.prototype.error).toHaveBeenCalled();
    });
  });

  describe('getPartialIndustryData', () => {
    it('should use vciExtendService to fetch partial industry data', async () => {
      const mockResponse = {
        data: [{ ticker: 'VNM', industry: 'Food & Beverage' }],
      };
      mockVciExtendService.getPartialIndustryData.mockResolvedValueOnce(
        mockResponse,
      );
      mockCacheManager.get.mockResolvedValue(null);

      const result = await service.getPartialIndustryData('Food & Beverage', [
        'ticker',
        'industry',
      ]);

      expect(result).toEqual(mockResponse);
      expect(mockVciExtendService.getPartialIndustryData).toHaveBeenCalledWith({
        industryName: 'Food & Beverage',
        fields: ['ticker', 'industry'],
      });
    });
  });

  describe('getIndustryCodes', () => {
    it('should use vciExtendService to fetch industry codes', async () => {
      const mockResponse = {
        data: [{ icbCode: '1234', icbName: 'Food & Beverage' }],
      };
      mockVciExtendService.getIndustryCodes.mockResolvedValueOnce(mockResponse);
      mockCacheManager.get.mockResolvedValue(null);

      const result = await service.getIndustryCodes();

      expect(result).toEqual(mockResponse);
      expect(mockVciExtendService.getIndustryCodes).toHaveBeenCalled();
    });
  });
});
