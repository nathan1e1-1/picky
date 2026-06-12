import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SavedScreen from '@/app/(tabs)/saved';
import { useSavedStore } from '@/store/savedStore';
import { PickyRestaurant } from '@picky/types';
import { router } from 'expo-router';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

const mockRestaurant: PickyRestaurant = {
  id: '1',
  googlePlaceId: 'ChIJ123',
  name: 'Test Restaurant',
  address: '123 Test St',
  coordinates: { lat: 37.7749, lng: -122.4194 },
  hours: { monday: '11:00-22:00' },
  isOpenNow: true,
  photos: [],
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

describe('SavedScreen', () => {
  beforeEach(() => {
    useSavedStore.setState({ saved: [] });
    jest.clearAllMocks();
  });

  it('navigates to restaurant detail when tapping a saved item', async () => {
    useSavedStore.getState().addSaved(mockRestaurant);

    const result = await render(<SavedScreen />);
    const item = result.getByText('Test Restaurant');
    const parent = result.getByLabelText('View details for Test Restaurant');

    fireEvent.press(parent);

    expect(router.push).toHaveBeenCalledWith('/restaurant/1');
  });

  it('removes item when tapping delete button', async () => {
    useSavedStore.getState().addSaved(mockRestaurant);

    const result = await render(<SavedScreen />);
    const deleteButton = result.getByLabelText('Remove Test Restaurant');

    fireEvent.press(deleteButton);

    expect(useSavedStore.getState().saved).toHaveLength(0);
    expect(router.push).not.toHaveBeenCalled();
  });

  it('shows empty state when no saved restaurants', async () => {
    const result = await render(<SavedScreen />);
    expect(result.getByText('No saved restaurants yet')).toBeTruthy();
  });

  it('shows saved count', async () => {
    useSavedStore.getState().addSaved(mockRestaurant);
    const result = await render(<SavedScreen />);
    expect(result.getByText('1 restaurant saved')).toBeTruthy();
  });
});
