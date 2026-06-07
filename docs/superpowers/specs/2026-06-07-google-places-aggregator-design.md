# Google Places Aggregator API — Design Spec

> **Date:** 2026-06-07
> **Status:** Approved
> **Scope:** Monorepo restructure + Fastify backend + Google Places integration + Mobile location integration

## 1. Goal

Build a Fastify backend that proxies Google Places API calls from the mobile app, returning restaurant data in the shared `PickyRestaurant` format. Restaurants appear based on the user's real-time location.

## 2. Monorepo Structure

```
picky/
├── apps/
│   ├── mobile/                  # Expo Router app (existing code moves here)
│   │   ├── app/                 # Screens
│   │   ├── components/          # Components
│   │   ├── store/               # Zustand stores
│   │   ├── __tests__/           # Mobile tests
│   │   └── package.json
│   └── server/                  # Fastify backend
│       ├── src/
│       │   ├── index.ts         # Server entry
│       │   ├── routes/
│       │   │   └── restaurants.ts
│       │   ├── services/
│       │   │   └── googlePlaces.ts
│       │   └── plugins/         # CORS, rate limit, etc.
│       ├── .env                 # Gitignored — API keys
│       └── package.json
├── packages/
│   ├── types/                   # @picky/types — shared interfaces
│   │   ├── restaurant.ts        # PickyRestaurant, MenuItem, MenuCategory
│   │   └── package.json
│   └── constants/               # @picky/constants — shared enums, config
│       └── package.json
├── turbo.json
└── package.json                 # Root workspace config
```

## 3. Shared Types Package (@picky/types)

Moved from root-level `types/` to `packages/types/` so both mobile and server import the same interfaces. No duplication, no drift.

```typescript
// packages/types/restaurant.ts
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
```

## 4. API Endpoint

### `GET /api/restaurants/nearby`

**Query Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `lat` | number | Yes | — | User latitude |
| `lng` | number | Yes | — | User longitude |
| `radius` | number | No | 5000 | Search radius in meters |
| `type` | string | No | `restaurant` | Google Places type |

**Response:** `200 OK` — `PickyRestaurant[]`

**Error Responses:**
| Status | Body | When |
|--------|------|------|
| 400 | `{ error: "Invalid coordinates" }` | Missing or malformed lat/lng |
| 429 | `{ error: "Rate limited" }` | Google Places rate limit hit |
| 500 | `{ error: "Service unavailable" }` | Google Places API error or key issue |

**Flow:**
1. Mobile sends `GET /api/restaurants/nearby?lat=37.7749&lng=-122.4194`
2. Server validates lat/lng
3. Server calls Google Places Nearby Search (`https://maps.googleapis.com/maps/api/place/nearbysearch/json`)
4. Server maps each Google Place result → `PickyRestaurant`
5. Server returns array to mobile

## 5. Google Places Integration

### Service: `services/googlePlaces.ts`

**API Key Setup:**
- Create Google Cloud project
- Enable Places API (New)
- Create API key restricted to Places API
- Store in `apps/server/.env` as `GOOGLE_PLACES_API_KEY`

**Nearby Search Request:**
```
GET https://maps.googleapis.com/maps/api/place/nearbysearch/json
  ?location={lat},{lng}
  &radius={radius}
  &type={type}
  &key={GOOGLE_PLACES_API_KEY}
```

**Fields Used:**
| Google Field | Maps To |
|--------------|---------|
| `name` | `name` |
| `place_id` | `googlePlaceId` |
| `vicinity` | `address` |
| `geometry.location.lat/lng` | `coordinates` |
| `opening_hours.open_now` | `isOpenNow` |
| `price_level` | `priceRange` (1-4) |
| `photos[].photo_reference` | `photos[]` via Place Photos API |
| `types` | `cuisineTypes` (filtered) |

**Photo URL Generation:**
```
https://maps.googleapis.com/maps/api/place/photo
  ?maxwidth=800
  &photo_reference={ref}
  &key={GOOGLE_PLACES_API_KEY}
```

**Cuisine Type Filtering:**
Filter out generic types (`establishment`, `point_of_interest`, `food`) and keep only cuisine-related types (`restaurant`, `cafe`, `bakery`, `bar`, `meal_takeaway`, etc.). Map Google types to human-readable cuisine names where possible.

## 6. Data Mapping (Google Places → PickyRestaurant)

**Populated fields:**
- `id`: Generated UUID (or `googlePlaceId` as fallback)
- `googlePlaceId`: `place_id`
- `name`, `address`, `coordinates`, `isOpenNow`, `priceRange`, `photos`, `cuisineTypes`
- `lastSyncedAt`: Current ISO timestamp

**Empty/default fields (for first iteration):**
- `yelpId`, `foursquareId`: `undefined`
- `phone`, `website`, `hours`: Empty/default
- `menu`: `[]`
- `pickyScore`: `0` (calculated later)
- `pickyScoreBreakdown`: All zeros
- `dietaryTags`: `[]` (not available from Google)
- `distance`: Calculated from user location to restaurant coordinates

## 7. Mobile Changes

### New Dependencies
- `expo-location` — Get user GPS coordinates
- `@picky/types` — Shared types (workspace dependency)

### Location Hook
```typescript
// hooks/useLocation.ts
import * as Location from 'expo-location';

export function useLocation() {
  // Request permission
  // Return { lat, lng, error, loading }
}
```

### API Client
```typescript
// lib/api.ts
const API_BASE = 'http://localhost:3000'; // Configurable per env

export async function fetchNearbyRestaurants(
  lat: number,
  lng: number,
  radius?: number
): Promise<PickyRestaurant[]> {
  const res = await fetch(
    `${API_BASE}/api/restaurants/nearby?lat=${lat}&lng=${lng}&radius=${radius || 5000}`
  );
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
```

### Feed Screen Update
Replace `mockRestaurants` with real API data:
- On mount: request location permission → get coords → fetch restaurants
- Show loading state while fetching
- Show error state if API fails
- Cache results in Zustand store?

## 8. Error Handling

### Server
- Log all Google Places errors with `place_id` and error code
- Return generic 500 to client (don't leak API key or internal errors)
- Implement rate limiting on `/api/restaurants/nearby` (e.g., 10 req/min per IP)

### Mobile
- Loading state: Skeleton cards or spinner
- Error state: "Can't find restaurants right now" + Retry button
- No results: "No restaurants found nearby" + Expand search radius option

## 9. Testing Strategy

| Layer | Tests |
|-------|-------|
| **Server routes** | `GET /api/restaurants/nearby` returns `PickyRestaurant[]` with mocked Google response |
| **Server service** | Google Places mock via `nock`, error cases (rate limit, invalid key), mapping logic |
| **Mobile hook** | Location permission granted/denied, coords returned, error states |
| **Mobile API client** | Fetch success, fetch error, timeout handling |
| **Integration** | End-to-end: mobile → server → mock Google → response |

## 10. Implementation Order

1. **Monorepo restructure** — Move existing mobile code to `apps/mobile/`, create `packages/types/`
2. **Fastify server setup** — `apps/server/` with basic routing, CORS, health check
3. **Google Places service** — API client, mapping logic, error handling
4. **API endpoint** — `GET /api/restaurants/nearby`
5. **Mobile location hook** — `expo-location` integration
6. **Mobile API integration** — Replace mock data with real API calls
7. **Tests** — Server service tests, route tests, mobile hook tests

## 11. Open Questions

- Should we cache Google Places results server-side (Redis/memory) to reduce API calls?
- Should the mobile app cache restaurant data locally?
- Do we need pagination for large result sets?

---

**Next Step:** Write implementation plan via `writing-plans` skill.
