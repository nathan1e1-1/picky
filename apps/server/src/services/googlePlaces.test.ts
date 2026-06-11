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
            rating: 4.5,
            user_ratings_total: 120,
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
    expect(results[0].pickyScore).toBe(90); // 4.5 * 20 = 90
    expect(results[0].pickyScoreBreakdown.googleRating).toBe(4.5);
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
            rating: 4.2,
            user_ratings_total: 120,
            photos: [{ photo_reference: 'photo1' }],
            business_status: 'OPERATIONAL',
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
            rating: 4.0,
            user_ratings_total: 120,
            photos: [{ photo_reference: 'photo1' }],
            business_status: 'OPERATIONAL',
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
            rating: 4.0,
            user_ratings_total: 120,
            photos: [{ photo_reference: 'photo1' }],
            business_status: 'OPERATIONAL',
          },
          {
            place_id: 'ChIJburger',
            name: 'Burger Joint',
            vicinity: '456 Mission St',
            geometry: { location: { lat: 37.784, lng: -122.4065 } },
            types: ['restaurant', 'food'],
            rating: 4.0,
            user_ratings_total: 120,
            photos: [{ photo_reference: 'photo2' }],
            business_status: 'OPERATIONAL',
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
    expect(callUrl).toContain('keyword=restaurant');
    expect(callUrl).toContain('minprice=2');
    expect(callUrl).toContain('key=test-key');
  });

  it('filters out permanently closed places', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        status: 'OK',
        results: [
          {
            place_id: 'ChIJclosed',
            name: 'Closed Forever',
            vicinity: '123 Market St',
            geometry: { location: { lat: 37.7749, lng: -122.4194 } },
            types: ['restaurant', 'food'],
            business_status: 'CLOSED_PERMANENTLY',
            rating: 4.0,
            user_ratings_total: 120,
            photos: [{ photo_reference: 'photo1' }],
          },
          {
            place_id: 'ChIJopen',
            name: 'Open Restaurant',
            vicinity: '456 Mission St',
            geometry: { location: { lat: 37.784, lng: -122.4065 } },
            types: ['restaurant', 'food'],
            business_status: 'OPERATIONAL',
            rating: 4.0,
            user_ratings_total: 120,
            photos: [{ photo_reference: 'photo2' }],
          },
        ],
      }),
    });

    const results = await service.searchNearby(37.7749, -122.4194);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Open Restaurant');
  });

  it('filters out places with no rating or low rating', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        status: 'OK',
        results: [
          {
            place_id: 'ChIJnoRating',
            name: 'No Rating Place',
            vicinity: '123 Market St',
            geometry: { location: { lat: 37.7749, lng: -122.4194 } },
            types: ['restaurant', 'food'],
            business_status: 'OPERATIONAL',
            user_ratings_total: 120,
            photos: [{ photo_reference: 'photo1' }],
          },
          {
            place_id: 'ChIJlow',
            name: 'Low Rating Place',
            vicinity: '456 Mission St',
            geometry: { location: { lat: 37.784, lng: -122.4065 } },
            types: ['restaurant', 'food'],
            business_status: 'OPERATIONAL',
            rating: 2.5,
            user_ratings_total: 120,
            photos: [{ photo_reference: 'photo2' }],
          },
          {
            place_id: 'ChIJgood',
            name: 'Good Restaurant',
            vicinity: '789 Mission St',
            geometry: { location: { lat: 37.784, lng: -122.4065 } },
            types: ['restaurant', 'food'],
            business_status: 'OPERATIONAL',
            rating: 4.0,
            user_ratings_total: 120,
            photos: [{ photo_reference: 'photo3' }],
          },
        ],
      }),
    });

    const results = await service.searchNearby(37.7749, -122.4194);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Good Restaurant');
  });

  it('filters out places with no photos', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        status: 'OK',
        results: [
          {
            place_id: 'ChIJnoPhoto',
            name: 'No Photo Place',
            vicinity: '123 Market St',
            geometry: { location: { lat: 37.7749, lng: -122.4194 } },
            types: ['restaurant', 'food'],
            business_status: 'OPERATIONAL',
            rating: 4.0,
            user_ratings_total: 120,
          },
          {
            place_id: 'ChIJphoto',
            name: 'Has Photo Restaurant',
            vicinity: '456 Mission St',
            geometry: { location: { lat: 37.784, lng: -122.4065 } },
            types: ['restaurant', 'food'],
            business_status: 'OPERATIONAL',
            rating: 4.0,
            user_ratings_total: 120,
            photos: [{ photo_reference: 'photo1' }],
          },
        ],
      }),
    });

    const results = await service.searchNearby(37.7749, -122.4194);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Has Photo Restaurant');
  });

  it('filters out meal_takeaway places', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        status: 'OK',
        results: [
          {
            place_id: 'ChIJtakeaway',
            name: 'Sketchy Takeaway',
            vicinity: '123 Market St',
            geometry: { location: { lat: 37.7749, lng: -122.4194 } },
            types: ['meal_takeaway', 'restaurant', 'food'],
            business_status: 'OPERATIONAL',
            rating: 4.0,
            user_ratings_total: 120,
            photos: [{ photo_reference: 'photo1' }],
          },
          {
            place_id: 'ChIJreal',
            name: 'Real Restaurant',
            vicinity: '456 Mission St',
            geometry: { location: { lat: 37.784, lng: -122.4065 } },
            types: ['restaurant', 'food'],
            business_status: 'OPERATIONAL',
            rating: 4.0,
            user_ratings_total: 120,
            photos: [{ photo_reference: 'photo2' }],
          },
        ],
      }),
    });

    const results = await service.searchNearby(37.7749, -122.4194);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Real Restaurant');
  });

  it('excludes food courts', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        status: 'OK',
        results: [
          {
            place_id: 'ChIJfoodcourt',
            name: 'Hawker Center',
            vicinity: '123 Market St',
            geometry: { location: { lat: 37.7749, lng: -122.4194 } },
            types: ['food_court', 'restaurant', 'food'],
            business_status: 'OPERATIONAL',
            rating: 4.0,
            user_ratings_total: 120,
            photos: [{ photo_reference: 'photo1' }],
          },
        ],
      }),
    });

    const results = await service.searchNearby(37.7749, -122.4194);
    expect(results).toHaveLength(0);
  });

  it('excludes meal delivery places', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        status: 'OK',
        results: [
          {
            place_id: 'ChIJdelivery',
            name: 'Delivery Only',
            vicinity: '123 Market St',
            geometry: { location: { lat: 37.7749, lng: -122.4194 } },
            types: ['meal_delivery', 'restaurant', 'food'],
            business_status: 'OPERATIONAL',
            rating: 4.0,
            user_ratings_total: 120,
            photos: [{ photo_reference: 'photo1' }],
          },
        ],
      }),
    });

    const results = await service.searchNearby(37.7749, -122.4194);
    expect(results).toHaveLength(0);
  });

  it('excludes places with sketchy names like stalls and carts', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        status: 'OK',
        results: [
          {
            place_id: 'ChIJstall',
            name: 'ABC Food Stall',
            vicinity: '123 Market St',
            geometry: { location: { lat: 37.7749, lng: -122.4194 } },
            types: ['restaurant', 'food'],
            business_status: 'OPERATIONAL',
            rating: 4.0,
            user_ratings_total: 120,
            photos: [{ photo_reference: 'photo1' }],
          },
          {
            place_id: 'ChIJtruck',
            name: 'Taco Truck',
            vicinity: '456 Mission St',
            geometry: { location: { lat: 37.784, lng: -122.4065 } },
            types: ['restaurant', 'food'],
            business_status: 'OPERATIONAL',
            rating: 4.0,
            user_ratings_total: 120,
            photos: [{ photo_reference: 'photo2' }],
          },
          {
            place_id: 'ChIJreal',
            name: 'Real Restaurant',
            vicinity: '789 Mission St',
            geometry: { location: { lat: 37.784, lng: -122.4065 } },
            types: ['restaurant', 'food'],
            business_status: 'OPERATIONAL',
            rating: 4.0,
            user_ratings_total: 120,
            photos: [{ photo_reference: 'photo3' }],
          },
        ],
      }),
    });

    const results = await service.searchNearby(37.7749, -122.4194);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Real Restaurant');
  });
});
