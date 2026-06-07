import React from 'react';
import { render } from '@testing-library/react-native';
import SwipeFeedScreen from '@/app/(tabs)/index';
import { useSavedStore } from '@/store/savedStore';

describe('SwipeFeedScreen', () => {
  beforeEach(() => {
    useSavedStore.setState({ saved: [] });
  });

  it('renders the feed with restaurant cards and balanced info', async () => {
    const { getByText, getAllByText } = await render(<SwipeFeedScreen />);

    // Header
    expect(getByText('Picky')).toBeTruthy();
    expect(getByText('5 spots nearby')).toBeTruthy();

    // First restaurant card with balanced overlay info
    expect(getByText('The Golden Spoon')).toBeTruthy();
    expect(getByText('0.8 mi')).toBeTruthy();
    // "Open Now" appears on multiple cards
    expect(getAllByText('Open Now').length).toBeGreaterThanOrEqual(1);
    // Tags in title case — "Italian" is unique to first card
    expect(getByText('Italian')).toBeTruthy();
    // "Vegetarian" appears on multiple cards
    expect(getAllByText('Vegetarian').length).toBeGreaterThanOrEqual(1);
    // "Gluten-Free" appears on multiple cards
    expect(getAllByText('Gluten-Free').length).toBeGreaterThanOrEqual(1);
  });

  it('renders the component without errors', async () => {
    const { getByText } = await render(<SwipeFeedScreen />);
    // Verify the main card stack renders
    expect(getByText('The Golden Spoon')).toBeTruthy();
  });
});
