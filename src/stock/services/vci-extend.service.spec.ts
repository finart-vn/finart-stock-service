import { Test, TestingModule } from '@nestjs/testing';
import { VciExtendService } from './vci-extend.service';
import axios from 'axios';
import { Logger } from '@nestjs/common';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('VciExtendService', () => {
  let service: VciExtendService;
  
  // Sample mock data that matches the structure of API response
  const mockCompaniesData = {
    data: {
      data: {
        CompaniesListingInfo: [
          {
            ticker: 'VCB',
            organName: 'Vietcombank',
            enOrganName: 'Vietcombank',
            icbName4: 'Ngân hàng',
            enIcbName4: 'Banking',
            comTypeCode: 'NH',
            __typename: 'CompanyListingInfo'
          },
          {
            ticker: 'TCB',
            organName: 'Techcombank',
            enOrganName: 'Techcombank',
            icbName4: 'Ngân hàng',
            enIcbName4: 'Banking',
            comTypeCode: 'NH',
            __typename: 'CompanyListingInfo'
          },
          {
            ticker: 'HPG',
            organName: 'Hòa Phát Group',
            enOrganName: 'Hoa Phat Group',
            icbName4: 'Thép và sản phẩm thép',
            enIcbName4: 'Steel',
            comTypeCode: 'CT',
            __typename: 'CompanyListingInfo'
          }
        ]
      }
    }
  };

  // Expected output after processing
  const expectedIndustriesOutput = [
    {
      industry: 'Ngân hàng',
      symbols: [
        {
          ticker: 'VCB',
          organName: 'Vietcombank',
          enOrganName: 'Vietcombank',
          comTypeCode: 'NH'
        },
        {
          ticker: 'TCB',
          organName: 'Techcombank',
          enOrganName: 'Techcombank',
          comTypeCode: 'NH'
        }
      ]
    },
    {
      industry: 'Thép và sản phẩm thép',
      symbols: [
        {
          ticker: 'HPG',
          organName: 'Hòa Phát Group',
          enOrganName: 'Hoa Phat Group',
          comTypeCode: 'CT'
        }
      ]
    }
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VciExtendService],
    }).compile();

    // Override the logger to avoid console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    
    service = module.get<VciExtendService>(VciExtendService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('symbolsByIndustries', () => {
    it('should group symbols by industry correctly', async () => {
      // Mock the axios.post to return our mock data
      mockedAxios.post.mockResolvedValueOnce(mockCompaniesData);
      
      // Call the service method
      const result = await service.symbolsByIndustries();
      
      // Sort both arrays to ensure consistent comparison regardless of order
      const sortedResult = sortIndustries(result);
      const sortedExpected = sortIndustries(expectedIndustriesOutput);
      
      // Verify the result matches our expectation
      expect(sortedResult).toEqual(sortedExpected);
      
      // Verify axios was called properly
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/data-mt/graphql'),
        expect.objectContaining({
          variables: {},
          query: expect.stringContaining('CompaniesListingInfo')
        }),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    it('should handle error when API request fails', async () => {
      // Mock the axios.post to throw an error
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));
      
      // Call the service method and expect it to throw
      await expect(service.symbolsByIndustries()).rejects.toThrow('Failed to fetch industry data: Network error');
    });

    it('should handle empty response properly', async () => {
      // Mock axios to return empty data
      mockedAxios.post.mockResolvedValueOnce({
        data: { data: { CompaniesListingInfo: [] } }
      });
      
      // Call the service method and expect it to throw
      await expect(service.symbolsByIndustries()).rejects.toThrow('No company data received from VCI GraphQL endpoint');
    });
  });
});

// Helper function to sort industries and symbols for reliable comparison
function sortIndustries(industries) {
  return [...industries]
    .sort((a, b) => a.industry.localeCompare(b.industry))
    .map(industry => ({
      ...industry,
      symbols: [...industry.symbols].sort((a, b) => a.ticker.localeCompare(b.ticker))
    }));
} 