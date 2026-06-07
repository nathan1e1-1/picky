/**
 * Integration test for the full swipe card flow.
 * 
 * Tests:
 * 1. SwipeCard renders with restaurant data
 * 2. SwipeFeedScreen manages card stack state correctly
 * 3. Right swipe saves restaurant
 * 4. Left swipe dismisses restaurant
 * 5. Empty state appears after all cards swiped
 * 6. Reset functionality works
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SwipeFeedScreen from '@/app/(tabs)/index';
import { useSavedStore } from '@/store/savedStore';

describe('Swipe Card Integration', () => {
  beforeEach(() => {
    useSavedStore.setState({ saved: [] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the first restaurant card', async () => {
    const { getByText } = await render(<SwipeFeedScreen />);
    
    expect(getByText('Picky')).toBeTruthy();
    expect(getByText('The Golden Spoon')).toBeTruthy();
    expect(getByText('Italian')).toBeTruthy();
    expect(getByText('5 spots nearby')).toBeTruthy();
  });

  it('saves restaurant on right swipe button press', async () => {
    const { getByText, getByLabelText } = await render(<SwipeFeedScreen />);
    
    expect(getByText('The Golden Spoon')).toBeTruthy();
    
    const saveButton = getByLabelText('Save restaurant');
    await fireEvent.press(saveButton);
    
    await waitFor(() => {
      const saved = useSavedStore.getState().saved;
      expect(saved).toHaveLength(1);
      expect(saved[0].name).toBe('The Golden Spoon');
    });
    
    // Next card should appear
    await waitFor(() => {
      expect(getByText('Sakura Sushi Bar')).toBeTruthy();
    });
  });

  it('dismisses restaurant on left swipe button press', async () => {
    const { getByText, getByLabelText } = await render(<SwipeFeedScreen />);
    
    expect(getByText('The Golden Spoon')).toBeTruthy();
    
    const dismissButton = getByLabelText('Dismiss restaurant');
    await fireEvent.press(dismissButton);
    
    await waitFor(() => {
      expect(useSavedStore.getState().saved).toHaveLength(0);
    });
    
    await waitFor(() => {
      expect(getByText('Sakura Sushi Bar')).toBeTruthy();
    });
  });

  it('shows empty state after all cards are dismissed', async () => {
    const { getByText, getByLabelText } = await render(<SwipeFeedScreen />);
    
    // Swipe through all 5 cards
    for (let i = 0; i < 5; i++) {
      const dismissButton = getByLabelText('Dismiss restaurant');
      await fireEvent.press(dismissButton);
    }
    
    await waitFor(() => {
      expect(getByText("You've seen it all!")).toBeTruthy();
      expect(getByText('Start Over')).toBeTruthy();
    });
  });

  it('resets card stack when Start Over is pressed', async () => {
    const { getByText, getByLabelText } = await render(<SwipeFeedScreen />);
    
    // Dismiss all cards
    for (let i = 0; i < 5; i++) {
      const dismissButton = getByLabelText('Dismiss restaurant');
      await fireEvent.press(dismissButton);
    }
    
    await waitFor(() => {
      expect(getByText('Start Over')).toBeTruthy();
    });
    
    await fireEvent.press(getByText('Start Over'));
    
    await waitFor(() => {
      expect(getByText('The Golden Spoon')).toBeTruthy();
      expect(getByText('5 spots nearby')).toBeTruthy();
    });
  });

  it('saves multiple restaurants in correct order', async () => {
    const { getByLabelText } = await render(<SwipeFeedScreen />);
    
    // Save first two restaurants
    const saveButton = getByLabelText('Save restaurant');
    await fireEvent.press(saveButton);
    
    await waitFor(() => {
      expect(useSavedStore.getState().saved).toHaveLength(1);
    });
    
    const saveButton2 = getByLabelText('Save restaurant');
    await fireEvent.press(saveButton2);
    
    await waitFor(() => {
      const saved = useSavedStore.getState().saved;
      expect(saved).toHaveLength(2);
      expect(saved[0].name).toBe('Sakura Sushi Bar');
      expect(saved[1].name).toBe('The Golden Spoon');
    });
  });
});
