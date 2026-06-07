import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import SwipeFeedScreen from '@/app/(tabs)/index';
import { fetchNearbyRestaurants } from '@/lib/api';

jest.mock('@/lib/api');

describe('SwipeFeedScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state while fetching location and restaurants', async () => {
    (fetchNearbyRestaurants as jest.Mock).mockImplementation(() => new Promise(() => {}));

    const { getByText } = await render(<SwipeFeedScreen />);

    expect(getByText('Finding restaurants near you...')).toBeTruthy();
  });

  it('renders restaurants after successful fetch', async () => {
    (fetchNearbyRestaurants as jest.Mock).mockResolvedValue([
      {
        id: '1',
        name: 'Test Restaurant',
        googlePlaceId: 'ChIJ123',
        address: '123 Main St',
        coordinates: { lat: 37.7749, lng: -122.4194 },
        isOpenNow: true,
        photos: [],
        cuisineTypes: ['Italian'],
        priceRange: 2,
        dietaryTags: [],
        menu: [],
        hours: {},
        pickyScore: 0,
        pickyScoreBreakdown: { googleRating: 0, yelpRating: 0, communityTipQuality: 0, visitToSaveRatio: 0, recencyBonus: 0 },
        lastSyncedAt: new Date().toISOString(),
      },
    ]);

    const { getByText } = await render(<SwipeFeedScreen />);

    await waitFor(() => expect(getByText('Test Restaurant')).toBeTruthy());
    expect(getByText('1 spots nearby')).toBeTruthy();
  });

  it('shows error state when API fails', async () => {
    (fetchNearbyRestaurants as jest.Mock).mockRejectedValue(new Error('API error'));

    const { getByText } = await render(<SwipeFeedScreen />);

    await waitFor(() => expect(getByText('API error')).toBeTruthy());
  });

  it('shows empty state when no restaurants returned', async () => {
    (fetchNearbyRestaurants as jest.Mock).mockResolvedValue([]);

    const { getByText } = await render(<SwipeFeedScreen />);

    await waitFor(() => expect(getByText("You've seen it all!")).toBeTruthy());
  });
});
