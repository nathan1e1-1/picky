import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import RestaurantDetailScreen from '@/app/restaurant/[id]';
import { RestaurantDetail } from '@/components/features/RestaurantDetail';
import { fetchPlaceDetails } from '@/lib/api';

jest.mock('@/lib/api');
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  router: { back: jest.fn(), push: jest.fn() },
}));

import { useLocalSearchParams } from 'expo-router';

describe('RestaurantDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state while fetching details', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'ChIJ123' });
    (fetchPlaceDetails as jest.Mock).mockImplementation(() => new Promise(() => {}));

    const result = await render(<RestaurantDetailScreen />);

    expect(result.getByText('Loading details...')).toBeTruthy();
  });

  it('renders details after successful fetch', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'ChIJ123' });
    (fetchPlaceDetails as jest.Mock).mockResolvedValue({
      placeId: 'ChIJ123',
      name: 'Test Bistro',
      address: '456 Oak Ave',
      phone: '(415) 555-0199',
      website: 'https://testbistro.com',
      isOpenNow: true,
      hours: { Monday: '11:00 AM – 10:00 PM', Tuesday: '11:00 AM – 10:00 PM' },
      photos: ['https://example.com/photo.jpg'],
      googleRating: 4.5,
      reviewCount: 120,
    });

    const result = await render(<RestaurantDetailScreen />);

    await waitFor(() => expect(result.getByText('Test Bistro')).toBeTruthy());
    expect(result.getByText('456 Oak Ave')).toBeTruthy();
    expect(result.getByText('(415) 555-0199')).toBeTruthy();
    expect(result.getByText('Open Now')).toBeTruthy();
    expect(result.getByText('4.5 (120 reviews)')).toBeTruthy();
  });

  it('shows error state when API fails', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'ChIJ123' });
    (fetchPlaceDetails as jest.Mock).mockRejectedValue(new Error('Network error'));

    const result = await render(<RestaurantDetailScreen />);

    await waitFor(() => expect(result.getByText('Network error')).toBeTruthy());
  });
});

describe('RestaurantDetail', () => {
  const mockDetails = {
    placeId: 'ChIJ123',
    name: 'Test Bistro',
    address: '456 Oak Ave',
    phone: '(415) 555-0199',
    website: 'https://testbistro.com',
    isOpenNow: true,
    hours: { Monday: '11:00 AM – 10:00 PM' },
    photos: ['https://example.com/photo.jpg'],
    googleRating: 4.5,
    reviewCount: 120,
  };

  it('calls onBack when back button pressed', async () => {
    const onBack = jest.fn();
    const result = await render(<RestaurantDetail details={mockDetails} onBack={onBack} />);

    const backButton = result.getByTestId('back-button');
    fireEvent.press(backButton);
    expect(onBack).toHaveBeenCalled();
  });
});
