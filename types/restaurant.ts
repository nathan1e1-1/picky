export interface PickyRestaurant {
  id: string;
  googlePlaceId: string;
  yelpId?: string;
  foursquareId?: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  phone?: string;
  website?: string;
  hours: Record<string, string>;
  isOpenNow: boolean;
  photos: string[];
  cuisineTypes: string[];
  priceRange: 1 | 2 | 3 | 4;
  pickyScore: number;
  pickyScoreBreakdown: {
    googleRating: number;
    yelpRating: number;
    communityTipQuality: number;
    visitToSaveRatio: number;
    recencyBonus: number;
  };
  menu: MenuCategory[];
  dietaryTags: string[];
  lastSyncedAt: string;
  distance?: string;
}

export interface MenuCategory {
  category: string;
  items: MenuItem[];
}

export interface MenuItem {
  name: string;
  description?: string;
  price?: number;
  dietaryTags: string[];
}
