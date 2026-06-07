import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import SwipeFeedScreen from '@/app/(tabs)/index';
import { fetchNearbyRestaurants } from '@/lib/api';

jest.mock('@/lib/api');

describe('Swipe Card Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the first restaurant card with balanced info', async () => {
    (fetchNearbyRestaurants as jest.Mock).mockResolvedValue([
      {
        id: '1',
        name: 'The Golden Spoon',
        googlePlaceId: 'ChIJ123',
        address: '123 Main St, San Francisco, CA',
        coordinates: { lat: 37.7749, lng: -122.4194 },
        isOpenNow: true,
        photos: ['https://example.com/photo.jpg'],
        cuisineTypes: ['Italian', 'Mediterranean'],
        priceRange: 3,
        dietaryTags: ['Vegetarian'],
        menu: [],
        hours: {},
        pickyScore: 87,
        pickyScoreBreakdown: {
          googleRating: 25,
          yelpRating: 18,
          communityTipQuality: 17,
          visitToSaveRatio: 18,
          recencyBonus: 9,
        },
        lastSyncedAt: new Date().toISOString(),
        distance: '0.8 mi',
      },
      {
        id: '2',
        name: 'Sakura Sushi Bar',
        googlePlaceId: 'ChIJ456',
        address: '456 Oak Ave, San Francisco, CA',
        coordinates: { lat: 37.7849, lng: -122.4094 },
        isOpenNow: true,
        photos: [],
        cuisineTypes: ['Japanese', 'Sushi'],
        priceRange: 2,
        dietaryTags: ['Gluten-Free'],
        menu: [],
        hours: {},
        pickyScore: 92,
        pickyScoreBreakdown: {
          googleRating: 28,
          yelpRating: 19,
          communityTipQuality: 18,
          visitToSaveRatio: 19,
          recencyBonus: 8,
        },
        lastSyncedAt: new Date().toISOString(),
        distance: '1.2 mi',
      },
    ]);

    const { getByText, getAllByText } = await render(<SwipeFeedScreen />);

    await waitFor(() => expect(getByText('Picky')).toBeTruthy());
    expect(getByText('The Golden Spoon')).toBeTruthy();
    expect(getByText('Italian')).toBeTruthy();
    expect(getByText('2 spots nearby')).toBeTruthy();
    expect(getByText('0.8 mi')).toBeTruthy();
    expect(getAllByText('Open Now').length).toBeGreaterThanOrEqual(1);
    expect(getByText('Vegetarian')).toBeTruthy();
  });

  it('renders multiple restaurant cards in the stack', async () => {
    (fetchNearbyRestaurants as jest.Mock).mockResolvedValue([
      {
        id: '1',
        name: 'The Golden Spoon',
        googlePlaceId: 'ChIJ123',
        address: '123 Main St',
        coordinates: { lat: 37.7749, lng: -122.4194 },
        isOpenNow: true,
        photos: [],
        cuisineTypes: ['Italian'],
        priceRange: 3,
        dietaryTags: [],
        menu: [],
        hours: {},
        pickyScore: 0,
        pickyScoreBreakdown: { googleRating: 0, yelpRating: 0, communityTipQuality: 0, visitToSaveRatio: 0, recencyBonus: 0 },
        lastSyncedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Sakura Sushi Bar',
        googlePlaceId: 'ChIJ456',
        address: '456 Oak Ave',
        coordinates: { lat: 37.7849, lng: -122.4094 },
        isOpenNow: true,
        photos: [],
        cuisineTypes: ['Japanese'],
        priceRange: 2,
        dietaryTags: [],
        menu: [],
        hours: {},
        pickyScore: 0,
        pickyScoreBreakdown: { googleRating: 0, yelpRating: 0, communityTipQuality: 0, visitToSaveRatio: 0, recencyBonus: 0 },
        lastSyncedAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Taco Libre',
        googlePlaceId: 'ChIJ789',
        address: '789 Mission St',
        coordinates: { lat: 37.784, lng: -122.4065 },
        isOpenNow: true,
        photos: [],
        cuisineTypes: ['Mexican'],
        priceRange: 1,
        dietaryTags: [],
        menu: [],
        hours: {},
        pickyScore: 0,
        pickyScoreBreakdown: { googleRating: 0, yelpRating: 0, communityTipQuality: 0, visitToSaveRatio: 0, recencyBonus: 0 },
        lastSyncedAt: new Date().toISOString(),
      },
    ]);

    const { getByText } = await render(<SwipeFeedScreen />);

    await waitFor(() => expect(getByText('The Golden Spoon')).toBeTruthy());
    expect(getByText('Sakura Sushi Bar')).toBeTruthy();
    expect(getByText('Taco Libre')).toBeTruthy();
  });
});
