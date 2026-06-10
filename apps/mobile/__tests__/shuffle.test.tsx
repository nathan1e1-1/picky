import { shuffle, jitterCoordinates, fetchWithTimeout } from '@/lib/api';

describe('shuffle', () => {
  it('returns a different order on subsequent calls', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let allSame = true;

    // Run multiple times to account for randomness
    for (let i = 0; i < 20; i++) {
      const shuffled = shuffle(items);
      if (shuffled[0] !== items[0] || shuffled[1] !== items[1]) {
        allSame = false;
      }
    }

    expect(allSame).toBe(false);
  });

  it('preserves all items without duplicates or omissions', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    const shuffled = shuffle(items);
    expect(shuffled).toHaveLength(5);
    expect(shuffled.sort()).toEqual(items.sort());
  });
});

describe('jitterCoordinates', () => {
  it('returns coordinates within ±0.015° of the input', () => {
    const { lat, lng } = jitterCoordinates(37.7749, -122.4194);
    expect(Math.abs(lat - 37.7749)).toBeLessThanOrEqual(0.015);
    expect(Math.abs(lng - -122.4194)).toBeLessThanOrEqual(0.015);
  });

  it('returns different values on subsequent calls', () => {
    const result1 = jitterCoordinates(37.7749, -122.4194);
    const result2 = jitterCoordinates(37.7749, -122.4194);
    expect(result1.lat !== result2.lat || result1.lng !== result2.lng).toBe(true);
  });
});

describe('fetchWithTimeout', () => {
  it('resolves when fetch succeeds within timeout', async () => {
    const mockResponse = { ok: true, json: async () => ({ data: 'test' }) };
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue(mockResponse);

    const result = await fetchWithTimeout('https://example.com', {}, 5000);
    expect(result).toBe(mockResponse);
  });

  it('rejects when fetch exceeds timeout', async () => {
    // Mock fetch to hang indefinitely
    (global.fetch as jest.Mock) = jest.fn().mockReturnValue(new Promise(() => {}));

    await expect(fetchWithTimeout('https://example.com', {}, 50)).rejects.toThrow('Request timed out');
  });
});
