import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SwipeFeedScreen from '@/app/(tabs)/index';
import { useSavedStore } from '@/store/savedStore';

describe('SwipeFeedScreen', () => {
  beforeEach(() => {
    // Reset the store before each test
    useSavedStore.setState({ saved: [] });
  });

  it('renders the feed with restaurant cards', async () => {
    const { getByText } = await render(<SwipeFeedScreen />);

    expect(getByText('Picky')).toBeTruthy();
    expect(getByText('5 spots nearby')).toBeTruthy();
  });

  it('increments activeIndex and saves restaurant on right swipe', async () => {
    const { getByText, getByLabelText } = await render(<SwipeFeedScreen />);

    // The first restaurant should be "The Golden Spoon"
    expect(getByText('The Golden Spoon')).toBeTruthy();

    // Press the save button (heart)
    const saveButton = getByLabelText('Save restaurant');
    await fireEvent.press(saveButton);

    // Wait for state update
    await waitFor(() => {
      // The saved store should now have 1 item
      expect(useSavedStore.getState().saved.length).toBe(1);
      expect(useSavedStore.getState().saved[0].name).toBe('The Golden Spoon');
    });

    // The next restaurant should now show
    await waitFor(() => {
      expect(getByText('Sakura Sushi Bar')).toBeTruthy();
    });
  });

  it('increments activeIndex on left swipe without saving', async () => {
    const { getByText, getByLabelText } = await render(<SwipeFeedScreen />);

    expect(getByText('The Golden Spoon')).toBeTruthy();

    // Press the dismiss button (X)
    const dismissButton = getByLabelText('Dismiss restaurant');
    await fireEvent.press(dismissButton);

    await waitFor(() => {
      // The saved store should still be empty
      expect(useSavedStore.getState().saved.length).toBe(0);
    });

    // The next restaurant should now show
    await waitFor(() => {
      expect(getByText('Sakura Sushi Bar')).toBeTruthy();
    });
  });

  it('shows empty state when all cards are swiped', async () => {
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

  it('resets to first card when Start Over is pressed', async () => {
    const { getByText, getByLabelText } = await render(<SwipeFeedScreen />);

    // Swipe through all cards
    for (let i = 0; i < 5; i++) {
      const dismissButton = getByLabelText('Dismiss restaurant');
      await fireEvent.press(dismissButton);
    }

    await waitFor(() => {
      expect(getByText('Start Over')).toBeTruthy();
    });

    // Press Start Over
    await fireEvent.press(getByText('Start Over'));

    await waitFor(() => {
      expect(getByText('The Golden Spoon')).toBeTruthy();
      expect(getByText('5 spots nearby')).toBeTruthy();
    });
  });
});
