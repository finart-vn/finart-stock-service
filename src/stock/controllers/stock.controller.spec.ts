import { Test, TestingModule } from '@nestjs/testing';
import { StockController } from './stock.controller';
import { StockService } from '../services/stock.service';
import { BadRequestException } from '@nestjs/common';

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
    }
  ]
];

const mockSymbols = {
  record_count: 2,
  ticker_info: [
    { ticker: 'VNM', organName: 'Vietnam Dairy Products JSC', industry: 'Food & Beverage' },
    { ticker: 'VHM', organName: 'Vinhomes JSC', industry: 'Real Estate' }
  ]
};

const mockPriceBoard = [
  {
    symbol: 'VNM',
    price: 80000,
    change: 1000,
    pctChange: 1.25
  }
];

const mockIndustriesData = [
  {
    industry: 'Food & Beverage',
    symbols: [{ ticker: 'VNM', organName: 'Vietnam Dairy Products JSC', industry: 'Food & Beverage' }]
  },
  {
    industry: 'Real Estate',
    symbols: [{ ticker: 'VHM', organName: 'Vinhomes JSC', industry: 'Real Estate' }]
  }
];

// Create a mock StockService
const createMockStockService = () => {
  return {
    getStockHistory: jest.fn().mockResolvedValue(mockHistoryData),
    getAllSymbols: jest.fn().mockResolvedValue(mockSymbols),
    getPriceBoard: jest.fn().mockResolvedValue(mockPriceBoard),
    getSymbolsByIndustries: jest.fn().mockResolvedValue(mockIndustriesData),
    clearCache: jest.fn().mockResolvedValue({ success: true, message: 'Cache cleared' }),
  };
};

describe('StockController', () => {
  let controller: StockController;
  let service: StockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockController],
      providers: [
        {
          provide: StockService,
          useValue: createMockStockService(),
        },
      ],
    }).compile();

    controller = module.get<StockController>(StockController);
    service = module.get<StockService>(StockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('getStockHistory', () => {
    it('should return stock history data', async () => {
      const symbols = ['VNM'];
      const startDate = '2023-01-01';
      const endDate = '2023-01-31';

      const result = await controller.getStockHistory(symbols, startDate, endDate);

      expect(result).toEqual(mockHistoryData);
      expect(service.getStockHistory).toHaveBeenCalledWith(symbols, startDate, endDate);
    });

    it('should handle requests without endDate', async () => {
      const symbols = ['VNM'];
      const startDate = '2023-01-01';

      const result = await controller.getStockHistory(symbols, startDate, undefined);

      expect(result).toEqual(mockHistoryData);
      expect(service.getStockHistory).toHaveBeenCalledWith(symbols, startDate, undefined);
    });

    it('should handle service errors', async () => {
      const symbols = ['VNM'];
      const startDate = '2023-01-01';
      const mockError = new Error('Service error');

      jest.spyOn(service, 'getStockHistory').mockRejectedValueOnce(mockError);

      await expect(controller.getStockHistory(symbols, startDate, undefined))
        .rejects
        .toThrow('Service error');
    });
  });

  describe('getAllSymbols', () => {
    it('should return all stock symbols', async () => {
      const result = await controller.getAllSymbols();

      expect(result).toEqual(mockSymbols);
      expect(service.getAllSymbols).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const mockError = new Error('Service error');

      jest.spyOn(service, 'getAllSymbols').mockRejectedValueOnce(mockError);

      await expect(controller.getAllSymbols())
        .rejects
        .toThrow('Service error');
    });
  });

  describe('getPriceBoard', () => {
    it('should return price board data', async () => {
      const symbols = ['VNM'];

      const result = await controller.getPriceBoard(symbols);

      expect(result).toEqual(mockPriceBoard);
      expect(service.getPriceBoard).toHaveBeenCalledWith(symbols);
    });

    it('should handle service errors', async () => {
      const symbols = ['VNM'];
      const mockError = new Error('Service error');

      jest.spyOn(service, 'getPriceBoard').mockRejectedValueOnce(mockError);

      await expect(controller.getPriceBoard(symbols))
        .rejects
        .toThrow('Service error');
    });
  });

  describe('getSymbolsByIndustries', () => {
    it('should return symbols grouped by industries', async () => {
      const result = await controller.getSymbolsByIndustries();

      expect(result).toEqual(mockIndustriesData);
      expect(service.getSymbolsByIndustries).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const mockError = new Error('Service error');

      jest.spyOn(service, 'getSymbolsByIndustries').mockRejectedValueOnce(mockError);

      await expect(controller.getSymbolsByIndustries())
        .rejects
        .toThrow('Service error');
    });
  });

  describe('clearCache', () => {
    it('should clear cache of the specified type', async () => {
      const type = 'industries';
      const symbols = 'VNM,VHM';

      await controller.clearCache(type, symbols);

      expect(service.clearCache).toHaveBeenCalledWith(type, ['VNM', 'VHM']);
    });

    it('should handle undefined symbols', async () => {
      const type = 'all';

      await controller.clearCache(type, undefined);

      expect(service.clearCache).toHaveBeenCalledWith(type, undefined);
    });
  });
}); 