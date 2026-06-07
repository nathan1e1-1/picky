import { useSavedStore } from '@/store/savedStore';
import { PickyRestaurant } from '@picky/types';

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
};

describe('Saved Store', () => {
  beforeEach(() => {
    useSavedStore.setState({ saved: [] });
  });

  it('adds a restaurant to saved list', () => {
    useSavedStore.getState().addSaved(mockRestaurant);

    expect(useSavedStore.getState().saved).toHaveLength(1);
    expect(useSavedStore.getState().saved[0].id).toBe('1');
    expect(useSavedStore.getState().saved[0].name).toBe('Test Restaurant');
  });

  it('does not add duplicate restaurants', () => {
    useSavedStore.getState().addSaved(mockRestaurant);
    useSavedStore.getState().addSaved(mockRestaurant);

    expect(useSavedStore.getState().saved).toHaveLength(1);
  });

  it('removes a restaurant from saved list', () => {
    useSavedStore.getState().addSaved(mockRestaurant);
    expect(useSavedStore.getState().saved).toHaveLength(1);

    useSavedStore.getState().removeSaved('1');
    expect(useSavedStore.getState().saved).toHaveLength(0);
  });

  it('maintains saved list order (newest first)', () => {
    const restaurant2: PickyRestaurant = { ...mockRestaurant, id: '2', name: 'Restaurant 2' };
    const restaurant3: PickyRestaurant = { ...mockRestaurant, id: '3', name: 'Restaurant 3' };

    useSavedStore.getState().addSaved(mockRestaurant);
    useSavedStore.getState().addSaved(restaurant2);
    useSavedStore.getState().addSaved(restaurant3);

    const saved = useSavedStore.getState().saved;
    expect(saved).toHaveLength(3);
    expect(saved[0].id).toBe('3');
    expect(saved[1].id).toBe('2');
    expect(saved[2].id).toBe('1');
  });
});
