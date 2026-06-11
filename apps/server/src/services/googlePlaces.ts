import { PickyRestaurant } from '@picky/types';
import { GooglePlace, GooglePlacesResponse } from '../types';

const NEARBY_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

function getApiKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    throw new Error('GOOGLE_PLACES_API_KEY not configured');
  }
  return key;
}

export class GooglePlacesService {
  private readonly EXCLUDED_TYPES = new Set([
    'lodging',
    'department_store',
    'gas_station',
    'car_rental',
    'supermarket',
    'shopping_mall',
    'electronics_store',
    'convenience_store',
    'hardware_store',
    'meal_takeaway',
    'food_court',
    'meal_delivery',
  ]);

  async searchNearby(
    lat: number,
    lng: number,
    radius: number = 5000,
    type: string = 'restaurant'
  ): Promise<PickyRestaurant[]> {
    const apiKey = getApiKey();

    const url = new URL(NEARBY_SEARCH_URL);
    url.searchParams.set('location', `${lat},${lng}`);
    url.searchParams.set('radius', String(radius));
    url.searchParams.set('keyword', 'restaurant');
    url.searchParams.set('minprice', '1');
    url.searchParams.set('key', apiKey);

    const response = await fetch(url.toString());
    const data: GooglePlacesResponse = await response.json();

    if (data.status === 'ZERO_RESULTS') {
      return [];
    }

    if (data.status !== 'OK') {
      throw new Error(`Google Places error: ${data.status} - ${data.error_message || ''}`);
    }

    return (data.results || [])
      .filter((place) => this.isRestaurant(place))
      .map((place) => this.mapToPickyRestaurant(place, lat, lng));
  }

  private isRestaurant(place: GooglePlace): boolean {
    // Exclude non-restaurant types
    if (place.types?.some((t) => this.EXCLUDED_TYPES.has(t))) {
      return false;
    }

    // Exclude permanently closed places
    if (place.business_status && place.business_status !== 'OPERATIONAL') {
      return false;
    }

    // Exclude places with no rating or very low rating
    if (place.rating === undefined || place.rating < 3.8) {
      return false;
    }

    // Exclude places with few reviews (less than 100 reviews = likely new/unestablished)
    if (place.user_ratings_total === undefined || place.user_ratings_total < 100) {
      return false;
    }

    // Exclude places with no photos (sketchy places often have no photos)
    if (!place.photos || place.photos.length === 0) {
      return false;
    }

    // Exclude places with sketchy names (stalls, carts, trucks, etc.)
    const sketchyNamePatterns = [
      'stall', 'cart', 'truck', 'hawker', 'food court',
      'kiosk', 'stand', 'vendor', 'pasar', 'market',
      'food centre', 'food center', 'food corner',
    ];
    const nameLower = place.name.toLowerCase();
    if (sketchyNamePatterns.some((pattern) => nameLower.includes(pattern))) {
      return false;
    }

    return true;
  }

  private mapToPickyRestaurant(place: GooglePlace, userLat: number, userLng: number): PickyRestaurant {
    const cuisineTypes = this.filterCuisineTypes(place.types || []);
    const distance = this.calculateDistance(
      userLat,
      userLng,
      place.geometry.location.lat,
      place.geometry.location.lng
    );

    return {
      id: place.place_id,
      googlePlaceId: place.place_id,
      name: place.name,
      address: place.vicinity,
      coordinates: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      },
      isOpenNow: place.opening_hours?.open_now ?? false,
      priceRange: (place.price_level || 2) as 1 | 2 | 3 | 4,
      photos: this.buildPhotoUrls(place.photos || []),
      cuisineTypes,
      dietaryTags: [],
      menu: [],
      hours: {},
      pickyScore: Math.round((place.rating || 0) * 20),
      pickyScoreBreakdown: {
        googleRating: place.rating || 0,
        yelpRating: 0,
        communityTipQuality: 0,
        visitToSaveRatio: 0,
        recencyBonus: 0,
      },
      lastSyncedAt: new Date().toISOString(),
      distance: `${distance.toFixed(1)} mi`,
    };
  }

  private filterCuisineTypes(types: string[]): string[] {
    const genericTypes = new Set([
      'establishment',
      'point_of_interest',
      'food',
      'store',
      'premise',
      'place_of_worship',
      'park',
    ]);
    return types
      .filter((t) => !genericTypes.has(t))
      .map((t) =>
        t
          .replace(/_/g, ' ')
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      );
  }

  private buildPhotoUrls(photos: Array<{ photo_reference: string }>): string[] {
    return photos.slice(0, 3).map((p) => {
      const url = new URL('https://maps.googleapis.com/maps/api/place/photo');
      url.searchParams.set('maxwidth', '800');
      url.searchParams.set('photo_reference', p.photo_reference);
      url.searchParams.set('key', getApiKey());
      return url.toString();
    });
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
