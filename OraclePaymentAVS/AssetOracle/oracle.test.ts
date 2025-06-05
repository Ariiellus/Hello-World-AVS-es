import { getPrice, getPriceHistory } from './oracle';

// Mock global fetch for unit tests
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe('Oracle Functions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPrice', () => {
    it('should return price for valid cryptocurrency ID', async () => {
      // Mock successful API response
      const mockResponse = {
        data: {
          price: 50000.25
        }
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const price = await getPrice(1);
      
      expect(price).toBe(50000.25);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.coinmarketcap.com/data-api/v3/cryptocurrency/detail?id=1&range=1h'
      );
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getPrice(1)).rejects.toThrow('Network error');
    });
  });

  describe('getPriceHistory', () => {
    it('should return price history for valid cryptocurrency ID', async () => {
      // Mock successful API response
      const mockResponse = {
        data: {
          priceHistory: [
            { timestamp: '2024-01-01', price: 50000 },
            { timestamp: '2024-01-02', price: 51000 }
          ]
        }
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const priceHistory = await getPriceHistory(1);
      
      expect(priceHistory).toEqual(mockResponse.data.priceHistory);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.coinmarketcap.com/data-api/v3/cryptocurrency/detail?id=1&range=1h'
      );
    });
  });
});

// Integration tests (uncomment to test against real API)
describe('Oracle Integration Tests', () => {
  // Restore real fetch for integration tests
  beforeAll(() => {
    global.fetch = require('node-fetch');
  });

  // Note: These tests make real API calls and may be slow or fail due to rate limits
  it.skip('should fetch real Bitcoin price (ID: 1)', async () => {
    const price = await getPrice(1);
    expect(typeof price).toBe('number');
    expect(price).toBeGreaterThan(0);
  }, 30000); // 30 second timeout

  it.skip('should fetch real Bitcoin price history (ID: 1)', async () => {
    const priceHistory = await getPriceHistory(1);
    expect(Array.isArray(priceHistory)).toBe(true);
  }, 30000);
}); 