import { shuffle } from '@/lib/api';

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
