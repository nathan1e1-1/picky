import { GooglePlacesService } from './googlePlaces';

describe('GooglePlacesService', () => {
  const service = new GooglePlacesService();
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.GOOGLE_PLACES_API_KEY = 'test-key';
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('maps Google Place to PickyRestaurant with all fields', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        status: 'OK',
        results: [
          {
            place_id: 'ChIJ123',
            name: 'Test Restaurant',
            vicinity: '123 Main St, San Francisco',
            geometry: { location: { lat: 37.7749, lng: -122.4194 } },
            opening_hours: { open_now: true },
            price_level: 2,
            photos: [{ photo_reference: 'photo123', width: 400, height: 300 }],
            types: ['restaurant', 'italian', 'food'],
          },
        ],
      }),
    });

    const results = await service.searchNearby(37.7749, -122.4194);

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Test Restaurant');
    expect(results[0].googlePlaceId).toBe('ChIJ123');
    expect(results[0].address).toBe('123 Main St, San Francisco');
    expect(results[0].coordinates).toEqual({ lat: 37.7749, lng: -122.4194 });
    expect(results[0].isOpenNow).toBe(true);
    expect(results[0].priceRange).toBe(2);
    expect(results[0].cuisineTypes).toContain('Italian');
    expect(results[0].cuisineTypes).not.toContain('Food');
    expect(results[0].photos[0]).toContain('photo_reference=photo123');
    expect(results[0].photos[0]).toContain('maxwidth=800');
    expect(results[0].distance).toMatch(/^\d+\.\d mi$/);
  });

  it('filters out generic types and title-cases cuisine', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        status: 'OK',
        results: [
          {
            place_id: 'ChIJ456',
            name: 'Sushi Bar',
            vicinity: '456 Oak Ave',
            geometry: { location: { lat: 37.7849, lng: -122.4094 } },
            types: ['restaurant', 'sushi', 'establishment', 'point_of_interest', 'food'],
          },
        ],
      }),
    });

    const results = await service.searchNearby(37.7749, -122.4194);

    expect(results[0].cuisineTypes).toEqual(['Restaurant', 'Sushi']);
  });

  it('handles closed restaurants', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        status: 'OK',
        results: [
          {
            place_id: 'ChIJ789',
            name: 'Closed Cafe',
            vicinity: '789 Mission St',
            geometry: { location: { lat: 37.784, lng: -122.4065 } },
            opening_hours: { open_now: false },
          },
        ],
      }),
    });

    const results = await service.searchNearby(37.7749, -122.4194);

    expect(results[0].isOpenNow).toBe(false);
  });

  it('returns empty array for ZERO_RESULTS', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ status: 'ZERO_RESULTS', results: [] }),
    });

    const results = await service.searchNearby(0, 0);
    expect(results).toEqual([]);
  });

  it('throws on API error status', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        status: 'REQUEST_DENIED',
        error_message: 'API key invalid',
      }),
    });

    await expect(service.searchNearby(0, 0)).rejects.toThrow('REQUEST_DENIED');
  });

  it('throws when API key is missing', async () => {
    delete process.env.GOOGLE_PLACES_API_KEY;

    await expect(service.searchNearby(0, 0)).rejects.toThrow('GOOGLE_PLACES_API_KEY not configured');
  });

  it('excludes places with lodging type (hotels)', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        status: 'OK',
        results: [
          {
            place_id: 'ChIJhotel',
            name: 'Marriott Downtown',
            vicinity: '123 Market St',
            geometry: { location: { lat: 37.7749, lng: -122.4194 } },
            types: ['lodging', 'restaurant', 'food'],
          },
          {
            place_id: 'ChIJburger',
            name: 'Burger Joint',
            vicinity: '456 Mission St',
            geometry: { location: { lat: 37.784, lng: -122.4065 } },
            types: ['restaurant', 'food'],
          },
        ],
      }),
    });

    const results = await service.searchNearby(37.7749, -122.4194);

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Burger Joint');
    expect(results[0].googlePlaceId).toBe('ChIJburger');
  });

  it('excludes department stores', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        status: 'OK',
        results: [
          {
            place_id: 'ChIJtarget',
            name: 'Target',
            vicinity: '789 Market St',
            geometry: { location: { lat: 37.7749, lng: -122.4194 } },
            types: ['department_store', 'food'],
          },
        ],
      }),
    });

    const results = await service.searchNearby(37.7749, -122.4194);
    expect(results).toHaveLength(0);
  });

  it('passes correct query parameters to Google API', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ status: 'ZERO_RESULTS', results: [] }),
    });

    await service.searchNearby(37.7749, -122.4194, 1000, 'cafe');

    const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(callUrl).toContain('location=37.7749%2C-122.4194');
    expect(callUrl).toContain('radius=1000');
    expect(callUrl).toContain('type=cafe');
    expect(callUrl).toContain('key=test-key');
  });
});
