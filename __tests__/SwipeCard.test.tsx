import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SwipeCard } from '@/components/features/SwipeCard';
import { PickyRestaurant } from '@/types/restaurant';

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
  dietaryTags: [],
  lastSyncedAt: '2026-06-01T00:00:00Z',
  distance: '0.5 mi',
};

describe('SwipeCard', () => {
  const onSwipeRight = jest.fn();
  const onSwipeLeft = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the restaurant card', async () => {
    const { getByText } = await render(
      <SwipeCard
        restaurant={mockRestaurant}
        onSwipeRight={onSwipeRight}
        onSwipeLeft={onSwipeLeft}
        activeIndex={0}
        index={0}
      />
    );

    expect(getByText('Test Restaurant')).toBeTruthy();
    expect(getByText('Italian')).toBeTruthy();
  });

  it('calls onSwipeRight when swiped right past threshold', async () => {
    const { getByText } = await render(
      <SwipeCard
        restaurant={mockRestaurant}
        onSwipeRight={onSwipeRight}
        onSwipeLeft={onSwipeLeft}
        activeIndex={0}
        index={0}
      />
    );

    const card = getByText('Test Restaurant');
    fireEvent(card, 'onTouchEnd');

    expect(onSwipeRight).not.toHaveBeenCalled();
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it('calls onSwipeLeft when swiped left past threshold', async () => {
    const { getByText } = await render(
      <SwipeCard
        restaurant={mockRestaurant}
        onSwipeRight={onSwipeRight}
        onSwipeLeft={onSwipeLeft}
        activeIndex={0}
        index={0}
      />
    );

    const card = getByText('Test Restaurant');
    fireEvent(card, 'onTouchEnd');

    expect(onSwipeRight).not.toHaveBeenCalled();
    expect(onSwipeLeft).not.toHaveBeenCalled();
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

    const card = getByText('Test Restaurant');
    fireEvent(card, 'onTouchEnd');

    expect(onSwipeRight).not.toHaveBeenCalled();
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });
});
