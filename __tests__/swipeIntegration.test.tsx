/**
 * Integration test for the full swipe card flow.
 * 
 * Tests rendering with balanced info overlay.
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import SwipeFeedScreen from '@/app/(tabs)/index';
import { useSavedStore } from '@/store/savedStore';

describe('Swipe Card Integration', () => {
  beforeEach(() => {
    useSavedStore.setState({ saved: [] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the first restaurant card with balanced info', async () => {
    const { getByText, getAllByText } = await render(<SwipeFeedScreen />);
    
    expect(getByText('Picky')).toBeTruthy();
    expect(getByText('The Golden Spoon')).toBeTruthy();
    expect(getByText('Italian')).toBeTruthy();
    expect(getByText('5 spots nearby')).toBeTruthy();
    expect(getByText('0.8 mi')).toBeTruthy();
    expect(getAllByText('Open Now').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Vegetarian').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Gluten-Free').length).toBeGreaterThanOrEqual(1);
  });

  it('renders multiple restaurant cards in the stack', async () => {
    const { getByText } = await render(<SwipeFeedScreen />);
    
    // All 5 restaurants should be rendered in the stack
    expect(getByText('The Golden Spoon')).toBeTruthy();
    expect(getByText('Sakura Sushi Bar')).toBeTruthy();
    expect(getByText('Taco Libre')).toBeTruthy();
    expect(getByText('Burger Joint')).toBeTruthy();
    expect(getByText('Spice Garden')).toBeTruthy();
  });
});
