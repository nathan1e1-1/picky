import { PickyRestaurant } from '@picky/types';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.111:3000';

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function jitterCoordinates(lat: number, lng: number): { lat: number; lng: number } {
  const offset = 0.015;
  return {
    lat: lat + (Math.random() - 0.5) * offset * 2,
    lng: lng + (Math.random() - 0.5) * offset * 2,
  };
}

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

  const data: PickyRestaurant[] = await response.json();
  return shuffle(data);
}

export async function fetchPlaceDetails(placeId: string): Promise<PlaceDetails> {
  const response = await fetch(`${API_BASE}/api/restaurants/${encodeURIComponent(placeId)}/details`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }
  return response.json();
}
