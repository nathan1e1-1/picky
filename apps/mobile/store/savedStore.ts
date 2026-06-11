import { create } from 'zustand';
import { PickyRestaurant } from '@picky/types';

interface SavedStore {
  saved: PickyRestaurant[];
  addSaved: (restaurant: PickyRestaurant) => void;
  removeSaved: (id: string) => void;
  getById: (id: string) => PickyRestaurant | undefined;
  isSaved: (id: string) => boolean;
}

export const useSavedStore = create<SavedStore>((set, get) => ({
  saved: [],
  addSaved: (restaurant) =>
    set((state) => {
      if (state.saved.find((r) => r.id === restaurant.id)) return state;
      return { saved: [restaurant, ...state.saved] };
    }),
  removeSaved: (id) =>
    set((state) => ({
      saved: state.saved.filter((r) => r.id !== id),
    })),
  getById: (id: string) => {
    return get().saved.find((r) => r.id === id);
  },
  isSaved: (id: string) => {
    return get().saved.some((r) => r.id === id);
  },
}));
