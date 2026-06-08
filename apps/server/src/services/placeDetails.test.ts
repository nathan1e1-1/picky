import { PlaceDetailsService } from './placeDetails';

describe('PlaceDetailsService', () => {
  const service = new PlaceDetailsService();
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.GOOGLE_PLACES_API_KEY = 'test-key';
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('fetches place details by place_id', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        result: {
          place_id: 'ChIJ123',
          name: 'Test Restaurant',
          formatted_address: '123 Main St, San Francisco, CA',
          formatted_phone_number: '(415) 555-0101',
          website: 'https://testrestaurant.com',
          opening_hours: {
            open_now: true,
            weekday_text: [
              'Monday: 11:00 AM – 10:00 PM',
              'Tuesday: 11:00 AM – 10:00 PM',
            ],
          },
          photos: [{ photo_reference: 'photo123' }],
          rating: 4.5,
          user_ratings_total: 200,
        },
        status: 'OK',
      }),
    });

    const details = await service.getDetails('ChIJ123');

    expect(details.name).toBe('Test Restaurant');
    expect(details.address).toBe('123 Main St, San Francisco, CA');
    expect(details.phone).toBe('(415) 555-0101');
    expect(details.website).toBe('https://testrestaurant.com');
    expect(details.isOpenNow).toBe(true);
    expect(details.hours).toEqual({
      monday: '11:00 AM – 10:00 PM',
      tuesday: '11:00 AM – 10:00 PM',
    });
    expect(details.photos[0]).toContain('photo_reference=photo123');
    expect(details.googleRating).toBe(4.5);
    expect(details.reviewCount).toBe(200);
  });

  it('handles missing optional fields', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        result: {
          place_id: 'ChIJ456',
          name: 'Minimal Place',
          formatted_address: '456 Oak Ave',
        },
        status: 'OK',
      }),
    });

    const details = await service.getDetails('ChIJ456');

    expect(details.name).toBe('Minimal Place');
    expect(details.phone).toBeUndefined();
    expect(details.website).toBeUndefined();
    expect(details.isOpenNow).toBe(false);
    expect(Object.keys(details.hours)).toHaveLength(0);
    expect(details.photos).toHaveLength(0);
    expect(details.googleRating).toBe(0);
    expect(details.reviewCount).toBe(0);
  });

  it('throws on API error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        status: 'NOT_FOUND',
      }),
    });

    await expect(service.getDetails('invalid')).rejects.toThrow('NOT_FOUND');
  });
});
