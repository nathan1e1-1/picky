import { GooglePlaceDetailsResponse } from '../types';

function getApiKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error('GOOGLE_PLACES_API_KEY not configured');
  return key;
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

export class PlaceDetailsService {
  async getDetails(placeId: string): Promise<PlaceDetails> {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.set('place_id', placeId);
    url.searchParams.set('fields', 'name,formatted_address,formatted_phone_number,website,opening_hours,photos,rating,user_ratings_total');
    url.searchParams.set('key', getApiKey());

    const response = await fetch(url.toString());
    const data: GooglePlaceDetailsResponse = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Place Details error: ${data.status}`);
    }

    const result = data.result;

    return {
      placeId,
      name: result.name,
      address: result.formatted_address || '',
      phone: result.formatted_phone_number,
      website: result.website,
      isOpenNow: result.opening_hours?.open_now ?? false,
      hours: this.parseHours(result.opening_hours?.weekday_text),
      photos: this.buildPhotoUrls(result.photos || []),
      googleRating: result.rating || 0,
      reviewCount: result.user_ratings_total || 0,
    };
  }

  private parseHours(weekdayText?: string[]): Record<string, string> {
    if (!weekdayText) return {};
    const hours: Record<string, string> = {};
    for (const line of weekdayText) {
      const parts = line.split(': ');
      if (parts.length >= 2) {
        const day = parts[0].toLowerCase();
        const time = parts.slice(1).join(': ');
        hours[day] = time;
      }
    }
    return hours;
  }

  private buildPhotoUrls(photos: Array<{ photo_reference: string }>): string[] {
    return photos.slice(0, 5).map((p) => {
      const url = new URL('https://maps.googleapis.com/maps/api/place/photo');
      url.searchParams.set('maxwidth', '800');
      url.searchParams.set('photo_reference', p.photo_reference);
      url.searchParams.set('key', getApiKey());
      return url.toString();
    });
  }
}
