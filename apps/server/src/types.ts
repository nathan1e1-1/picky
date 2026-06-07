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
