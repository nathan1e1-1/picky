import { PickyRestaurant } from '@picky/types';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.111:3000';

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
