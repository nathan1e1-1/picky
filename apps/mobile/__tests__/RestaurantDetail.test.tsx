import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import RestaurantDetailScreen from '@/app/restaurant/[id]';
import { RestaurantDetail } from '@/components/features/RestaurantDetail';
import { fetchPlaceDetails } from '@/lib/api';
import { useSavedStore } from '@/store/savedStore';
import { PickyRestaurant } from '@picky/types';

jest.mock('@/lib/api');
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  router: { back: jest.fn(), push: jest.fn() },
}));

import { useLocalSearchParams } from 'expo-router';

const mockRestaurant: PickyRestaurant = {
  id: 'ChIJ123',
  googlePlaceId: 'ChIJ123',
  name: 'Test Bistro',
  address: '456 Oak Ave',
  coordinates: { lat: 37.7749, lng: -122.4194 },
  phone: '(415) 555-0199',
  website: 'https://testbistro.com',
  isOpenNow: true,
  hours: { Monday: '11:00 AM – 10:00 PM', Tuesday: '11:00 AM – 10:00 PM' },
  photos: ['https://example.com/photo.jpg'],
  cuisineTypes: ['Italian', 'European'],
  priceRange: 2,
  pickyScore: 90,
  pickyScoreBreakdown: {
    googleRating: 4.5,
    yelpRating: 4.2,
    communityTipQuality: 85,
    visitToSaveRatio: 0.8,
    recencyBonus: 10,
  },
  menu: [
    {
      category: 'Starters',
      items: [
        { name: 'Bruschetta', description: 'Tomato, basil, garlic', price: 12.99, dietaryTags: ['Vegetarian'] },
      ],
    },
  ],
  dietaryTags: ['Vegetarian', 'Gluten-Free'],
  lastSyncedAt: '2024-01-01T00:00:00Z',
  distance: '0.8 mi',
};

const mockPlaceDetailsResponse = {
  id: 'ChIJ123',
  name: 'Test Bistro',
  address: '456 Oak Ave',
  coordinates: { lat: 37.7749, lng: -122.4194 },
  phone: '(415) 555-0199',
  website: 'https://testbistro.com',
  isOpenNow: true,
  hours: { Monday: '11:00 AM – 10:00 PM', Tuesday: '11:00 AM – 10:00 PM' },
  photos: ['https://example.com/photo.jpg'],
  googleRating: 4.5,
  reviewCount: 120,
  cuisineTypes: ['Italian', 'European'],
  priceRange: 2,
  dietaryTags: ['Vegetarian'],
};

describe('RestaurantDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSavedStore.setState({ saved: [] });
  });

  it('shows loading state while fetching details from server', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'ChIJ123' });
    (fetchPlaceDetails as jest.Mock).mockImplementation(() => new Promise(() => {}));

    const result = await render(<RestaurantDetailScreen />);

    expect(result.getByText('Loading details...')).toBeTruthy();
  });

  it('renders from saved store without API call when hours exist', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'ChIJ123' });
    useSavedStore.getState().addSaved(mockRestaurant);

    const result = await render(<RestaurantDetailScreen />);

    await waitFor(() => expect(result.getByText('Test Bistro')).toBeTruthy());
    expect(result.getByText('456 Oak Ave')).toBeTruthy();
    expect(result.getByText('Open Now')).toBeTruthy();
    expect(result.getByText('0.8 mi away')).toBeTruthy();
    expect(fetchPlaceDetails).not.toHaveBeenCalled();
  });

  it('fetches from server when saved restaurant has empty hours', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'ChIJ123' });
    const restaurantWithEmptyHours = { ...mockRestaurant, hours: {} };
    useSavedStore.getState().addSaved(restaurantWithEmptyHours);
    (fetchPlaceDetails as jest.Mock).mockResolvedValue(mockPlaceDetailsResponse);

    const result = await render(<RestaurantDetailScreen />);

    await waitFor(() => expect(result.getByText('Test Bistro')).toBeTruthy());
    expect(fetchPlaceDetails).toHaveBeenCalledWith('ChIJ123');
  });

  it('renders details after successful server fetch', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'ChIJ123' });
    (fetchPlaceDetails as jest.Mock).mockResolvedValue(mockPlaceDetailsResponse);

    const result = await render(<RestaurantDetailScreen />);

    await waitFor(() => expect(result.getByText('Test Bistro')).toBeTruthy());
    expect(result.getByText('456 Oak Ave')).toBeTruthy();
    expect(result.getByText('(415) 555-0199')).toBeTruthy();
    expect(result.getByText('Open Now')).toBeTruthy();
  });

  it('shows error state when API fails', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'ChIJ123' });
    (fetchPlaceDetails as jest.Mock).mockRejectedValue(new Error('Network error'));

    const result = await render(<RestaurantDetailScreen />);

    await waitFor(() => expect(result.getByText('Network error')).toBeTruthy());
  });
});

describe('RestaurantDetail', () => {
  it('calls onBack when back button pressed', async () => {
    const onBack = jest.fn();
    const result = await render(<RestaurantDetail restaurant={mockRestaurant} onBack={onBack} />);

    const backButton = result.getByTestId('back-button');
    fireEvent.press(backButton);
    expect(onBack).toHaveBeenCalled();
  });

  it('renders all tabs', async () => {
    const result = await render(<RestaurantDetail restaurant={mockRestaurant} onBack={jest.fn()} />);

    expect(result.getByTestId('tab-info')).toBeTruthy();
    expect(result.getByTestId('tab-menu')).toBeTruthy();
    expect(result.getByTestId('tab-location')).toBeTruthy();
    expect(result.getByTestId('tab-hours')).toBeTruthy();
  });

  it('switches to menu tab and shows menu items', async () => {
    const result = await render(<RestaurantDetail restaurant={mockRestaurant} onBack={jest.fn()} />);

    fireEvent.press(result.getByTestId('tab-menu'));
    await waitFor(() => expect(result.getByText('Starters')).toBeTruthy());
    expect(result.getByText('Bruschetta')).toBeTruthy();
    expect(result.getByText('Tomato, basil, garlic')).toBeTruthy();
    expect(result.getByText('$12.99')).toBeTruthy();
    expect(result.getByText('Vegetarian')).toBeTruthy();
  });

  it('switches to location tab and shows address and distance', async () => {
    const result = await render(<RestaurantDetail restaurant={mockRestaurant} onBack={jest.fn()} />);

    fireEvent.press(result.getByTestId('tab-location'));
    await waitFor(() => expect(result.getByText('456 Oak Ave')).toBeTruthy());
    expect(result.getByText('0.8 mi away')).toBeTruthy();
    expect(result.getByText('Open in Maps')).toBeTruthy();
  });

  it('switches to hours tab and shows schedule', async () => {
    const result = await render(<RestaurantDetail restaurant={mockRestaurant} onBack={jest.fn()} />);

    fireEvent.press(result.getByTestId('tab-hours'));
    await waitFor(() => expect(result.getByText('Monday')).toBeTruthy());
    expect(result.getAllByText('11:00 AM – 10:00 PM').length).toBeGreaterThanOrEqual(1);
  });

  it('shows menu not available for empty menu', async () => {
    const restaurantNoMenu = { ...mockRestaurant, menu: [] };
    const result = await render(<RestaurantDetail restaurant={restaurantNoMenu} onBack={jest.fn()} />);

    fireEvent.press(result.getByTestId('tab-menu'));
    await waitFor(() =>
      expect(result.getByText('Menu not available')).toBeTruthy()
    );
  });

  it('shows hours not available for empty hours', async () => {
    const restaurantNoHours = { ...mockRestaurant, hours: {} };
    const result = await render(<RestaurantDetail restaurant={restaurantNoHours} onBack={jest.fn()} />);

    fireEvent.press(result.getByTestId('tab-hours'));
    await waitFor(() => expect(result.getByText('Hours not available')).toBeTruthy());
  });

  it('splits multi-range hours onto separate lines', async () => {
    const restaurantSplitHours = {
      ...mockRestaurant,
      hours: { Monday: '11:00 AM – 2:30 PM, 5:00 PM – 10:00 PM' },
    };
    const result = await render(<RestaurantDetail restaurant={restaurantSplitHours} onBack={jest.fn()} />);

    fireEvent.press(result.getByTestId('tab-hours'));
    await waitFor(() => expect(result.getByText('Monday')).toBeTruthy());
    expect(result.getByText('11:00 AM – 2:30 PM')).toBeTruthy();
    expect(result.getByText('5:00 PM – 10:00 PM')).toBeTruthy();
  });

  it('shows cuisine type chips in info tab', async () => {
    const result = await render(<RestaurantDetail restaurant={mockRestaurant} onBack={jest.fn()} />);

    expect(result.getByText('Italian')).toBeTruthy();
    expect(result.getByText('European')).toBeTruthy();
  });

  it('shows price range in info tab', async () => {
    const result = await render(<RestaurantDetail restaurant={mockRestaurant} onBack={jest.fn()} />);

    expect(result.getByText('$$')).toBeTruthy();
  });
});
