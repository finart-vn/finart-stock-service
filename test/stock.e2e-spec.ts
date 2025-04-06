import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

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

describe('StockController (e2e)', () => {
  let app: INestApplication;
  let mockCacheManager: any;

  beforeEach(async () => {
    // Create mock cache manager
    mockCacheManager = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined)
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CACHE_MANAGER)
      .useValue(mockCacheManager)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/api/stock/history (GET)', () => {
    it('should return stock history data', async () => {
      // Set up cache mock to return history data
      mockCacheManager.get.mockResolvedValue(mockHistoryData);

      return request(app.getHttpServer())
        .get('/api/stock/history?symbols=VNM&startDate=2023-01-01&endDate=2023-01-10')
        .expect(200)
        .expect(mockHistoryData);
    });

    it('should handle missing required parameters', async () => {
      return request(app.getHttpServer())
        .get('/api/stock/history')
        .expect(400);
    });
  });

  describe('/api/stock/symbols (GET)', () => {
    it('should return stock symbols', async () => {
      // Set up cache mock to return symbols
      mockCacheManager.get.mockResolvedValue(mockSymbols);

      return request(app.getHttpServer())
        .get('/api/stock/symbols')
        .expect(200)
        .expect(mockSymbols);
    });
  });

  describe('/api/stock/prices (GET)', () => {
    it('should return price board data', async () => {
      // Set up cache mock to return price data
      mockCacheManager.get.mockResolvedValue(mockPriceBoard);

      return request(app.getHttpServer())
        .get('/api/stock/prices?symbols=VNM')
        .expect(200)
        .expect(mockPriceBoard);
    });

    it('should handle missing required parameters', async () => {
      return request(app.getHttpServer())
        .get('/api/stock/prices')
        .expect(400);
    });
  });
}); 