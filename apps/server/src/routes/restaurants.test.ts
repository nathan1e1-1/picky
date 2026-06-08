import fastify from 'fastify';
import { restaurantRoutes } from './restaurants';

describe('restaurantRoutes', () => {
  const app = fastify();
  const originalFetch = global.fetch;

  beforeAll(async () => {
    process.env.GOOGLE_PLACES_API_KEY = 'test-key';
    await app.register(restaurantRoutes, { prefix: '/api/restaurants' });
  });

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns restaurants for valid coordinates', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        status: 'OK',
        results: [
          {
            place_id: 'ChIJ123',
            name: 'Test Restaurant',
            vicinity: '123 Main St',
            geometry: { location: { lat: 37.7749, lng: -122.4194 } },
            types: ['restaurant'],
          },
        ],
      }),
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/restaurants/nearby?lat=37.7749&lng=-122.4194',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveLength(1);
    expect(body[0].name).toBe('Test Restaurant');
    expect(body[0].googlePlaceId).toBe('ChIJ123');
  });

  it('returns 400 for invalid coordinates', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/restaurants/nearby?lat=invalid&lng=invalid',
    });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ error: 'Invalid coordinates' });
  });

  it('returns 400 for missing coordinates', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/restaurants/nearby',
    });

    expect(response.statusCode).toBe(400);
  });

  it('returns 500 when Google Places API errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        status: 'REQUEST_DENIED',
        error_message: 'Bad key',
      }),
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/restaurants/nearby?lat=37.7749&lng=-122.4194',
    });

    expect(response.statusCode).toBe(500);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Service unavailable');
    expect(body.detail).toBeDefined();
  });

  it('returns empty array when no results found', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ status: 'ZERO_RESULTS', results: [] }),
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/restaurants/nearby?lat=0&lng=0',
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual([]);
  });

  it('passes query params to Google Places', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ status: 'ZERO_RESULTS', results: [] }),
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/restaurants/nearby?lat=37.7749&lng=-122.4194&radius=1000&type=cafe',
    });

    expect(response.statusCode).toBe(200);

    const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(callUrl).toContain('radius=1000');
    expect(callUrl).toContain('type=cafe');
  });

  it('returns place details for a valid place_id', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        result: {
          place_id: 'ChIJ123',
          name: 'Test Restaurant',
          formatted_address: '123 Main St',
          formatted_phone_number: '(415) 555-0101',
          website: 'https://test.com',
          opening_hours: { open_now: true, weekday_text: ['Monday: 11:00 AM – 10:00 PM'] },
          photos: [],
          rating: 4.5,
          user_ratings_total: 100,
        },
        status: 'OK',
      }),
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/restaurants/ChIJ123/details',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.name).toBe('Test Restaurant');
    expect(body.phone).toBe('(415) 555-0101');
    expect(body.website).toBe('https://test.com');
    expect(body.isOpenNow).toBe(true);
  });
});
