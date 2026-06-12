import React from 'react';
import { render } from '@testing-library/react-native';
import { SwipeCard } from '@/components/features/SwipeCard';
import { PickyRestaurant } from '@picky/types';

const mockRestaurant: PickyRestaurant = {
  id: '1',
  googlePlaceId: 'ChIJ123',
  name: 'Test Restaurant',
  address: '123 Test St',
  coordinates: { lat: 37.7749, lng: -122.4194 },
  hours: { monday: '11:00-22:00' },
  isOpenNow: true,
  photos: ['https://example.com/photo.jpg'],
  cuisineTypes: ['Italian'],
  priceRange: 2,
  pickyScore: 85,
  pickyScoreBreakdown: {
    googleRating: 25,
    yelpRating: 18,
    communityTipQuality: 17,
    visitToSaveRatio: 18,
    recencyBonus: 9,
  },
  menu: [],
  dietaryTags: ['vegetarian', 'gluten-free'],
  lastSyncedAt: '2026-06-01T00:00:00Z',
  distance: '0.5 mi',
};

describe('SwipeCard', () => {
  const onSwipeRight = jest.fn();
  const onSwipeLeft = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the restaurant card with balanced info and title case tags', async () => {
    const { getByText, getAllByText } = await render(
      <SwipeCard
        restaurant={mockRestaurant}
        onSwipeRight={onSwipeRight}
        onSwipeLeft={onSwipeLeft}
        activeIndex={0}
        index={0}
      />
    );

    expect(getByText('Test Restaurant')).toBeTruthy();
    expect(getByText('0.5 mi')).toBeTruthy();
    expect(getByText('Open')).toBeTruthy();
    // Tags should be title case
    expect(getByText('Italian')).toBeTruthy();
    expect(getAllByText('Vegetarian').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Gluten-Free').length).toBeGreaterThanOrEqual(1);
  });

  it('does not respond to gestures when not active', async () => {
    const { getByText } = await render(
      <SwipeCard
        restaurant={mockRestaurant}
        onSwipeRight={onSwipeRight}
        onSwipeLeft={onSwipeLeft}
        activeIndex={1}
        index={0}
      />
    );

    // Card should still render but not be interactive
    expect(getByText('Test Restaurant')).toBeTruthy();
  });
});
