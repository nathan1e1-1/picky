import { PickyRestaurant } from '@picky/types';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.111:3000';

export interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  isOpenNow: boolean;
  hours: Record<string, string>;
  photos: string[];
  googleRating: number;
  reviewCount: number;
}

export async function fetchNearbyRestaurants(
  lat: number,
  lng: number,
  radius: number = 5000
): Promise<PickyRestaurant[]> {
  const url = new URL(`${API_BASE}/api/restaurants/nearby`);
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lng', String(lng));
  url.searchParams.set('radius', String(radius));

  const response = await fetch(url.toString());
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

export async function fetchPlaceDetails(placeId: string): Promise<PlaceDetails> {
  const response = await fetch(`${API_BASE}/api/restaurants/${encodeURIComponent(placeId)}/details`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }
  return response.json();
}
