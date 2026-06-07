import { create } from 'zustand';
import { PickyRestaurant } from '@picky/types';

interface SavedStore {
  saved: PickyRestaurant[];
  addSaved: (restaurant: PickyRestaurant) => void;
  removeSaved: (id: string) => void;
}

export const useSavedStore = create<SavedStore>((set) => ({
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
}));
