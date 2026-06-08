export interface GooglePlace {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: { lat: number; lng: number };
  };
  opening_hours?: { open_now?: boolean };
  price_level?: number;
  photos?: Array<{ photo_reference: string; width: number; height: number }>;
  types?: string[];
  rating?: number;
  user_ratings_total?: number;
}

export interface GooglePlacesResponse {
  results: GooglePlace[];
  status: string;
  next_page_token?: string;
  error_message?: string;
}

export interface GooglePlaceDetailsResponse {
  result: {
    place_id: string;
    name: string;
    formatted_address?: string;
    formatted_phone_number?: string;
    website?: string;
    opening_hours?: {
      open_now?: boolean;
      weekday_text?: string[];
    };
    photos?: Array<{ photo_reference: string }>;
    rating?: number;
    user_ratings_total?: number;
  };
  status: string;
  error_message?: string;
}
