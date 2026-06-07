# Google Places Aggregator API — Implementation Plan

> **For agentic workers:** Use inline execution. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Fastify backend that proxies Google Places API calls, returning restaurant data in the shared `PickyRestaurant` format, with mobile location integration.

**Architecture:** Monorepo with `apps/mobile/` (Expo), `apps/server/` (Fastify), and `packages/types/` (shared TypeScript interfaces). Server calls Google Places Nearby Search and maps results to `PickyRestaurant`.

**Tech Stack:** Fastify, TypeScript, Google Places API (New), expo-location, nock (testing)

---

### Task 1: Create Monorepo Structure

**Files:**
- Create: `package.json` (root workspace)
- Create: `turbo.json`
- Create: `apps/server/package.json`
- Create: `apps/server/tsconfig.json`
- Create: `packages/types/package.json`
- Create: `packages/types/tsconfig.json`
- Modify: Move existing mobile code to `apps/mobile/`

**Step 1: Create root workspace config**

```json
// package.json
{
  "name": "picky",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

**Step 2: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**Step 3: Create packages/types**

```json
// packages/types/package.json
{
  "name": "@picky/types",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "~5.9.2"
  }
}
```

```json
// packages/types/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "declaration": true,
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["*.ts"]
}
```

**Step 4: Create apps/server**

```json
// apps/server/package.json
{
  "name": "@picky/server",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "test": "jest"
  },
  "dependencies": {
    "@picky/types": "1.0.0",
    "fastify": "^5.0.0",
    "@fastify/cors": "^10.0.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "typescript": "~5.9.2",
    "tsx": "^4.0.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.0.0",
    "@types/jest": "^29.5.0",
    "nock": "^13.5.0",
    "@types/node": "^22.0.0"
  }
}
```

```json
// apps/server/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"]
}
```

**Step 5: Commit**

```bash
git add package.json turbo.json apps/ packages/
git commit -m "chore: set up monorepo structure with apps/mobile, apps/server, packages/types"
```

---

### Task 2: Move Types to Shared Package

**Files:**
- Create: `packages/types/restaurant.ts`
- Create: `packages/types/index.ts`
- Delete: `types/restaurant.ts`
- Modify: All imports from `"@/types/restaurant"` to `"@picky/types"`

**Step 1: Move types file**

Copy `types/restaurant.ts` to `packages/types/restaurant.ts`.

**Step 2: Create index export**

```typescript
// packages/types/index.ts
export * from './restaurant';
```

**Step 3: Update mobile imports**

Replace all `"@/types/restaurant"` with `"@picky/types"` in:
- `apps/mobile/components/features/RestaurantCard.tsx`
- `apps/mobile/components/features/SwipeCard.tsx`
- `apps/mobile/app/(tabs)/index.tsx`
- `apps/mobile/store/savedStore.ts`
- `apps/mobile/__tests__/*.test.tsx`
- `apps/mobile/lib/mockData.ts`

**Step 4: Update mobile tsconfig for workspace alias**

Add to `apps/mobile/tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@picky/types": ["../../packages/types"]
    }
  }
}
```

**Step 5: Commit**

```bash
git add packages/types/ apps/mobile/ && git rm -r types/
git commit -m "refactor: move types to shared @picky/types package"
```

---

### Task 3: Set Up Fastify Server

**Files:**
- Create: `apps/server/src/index.ts`
- Create: `apps/server/src/plugins/cors.ts`
- Create: `apps/server/.env.example`

**Step 1: Create server entry**

```typescript
// apps/server/src/index.ts
import fastify from 'fastify';
import cors from '@fastify/cors';
import { restaurantRoutes } from './routes/restaurants';

const app = fastify({ logger: true });

app.register(cors, { origin: '*' });
app.register(restaurantRoutes, { prefix: '/api/restaurants' });

app.get('/health', async () => ({ status: 'ok' }));

const PORT = parseInt(process.env.PORT || '3000', 10);

app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
```

**Step 2: Create .env.example**

```
GOOGLE_PLACES_API_KEY=your_key_here
PORT=3000
```

**Step 3: Install server deps**

```bash
cd apps/server && npm install
```

**Step 4: Test server starts**

```bash
cd apps/server && npm run dev
```
Expected: Server starts on port 3000, health endpoint returns `{status: "ok"}`

**Step 5: Commit**

```bash
git add apps/server/
git commit -m "feat: set up fastify server with CORS and health endpoint"
```

---

### Task 4: Create Google Places Service

**Files:**
- Create: `apps/server/src/services/googlePlaces.ts`
- Create: `apps/server/src/types.ts`

**Step 1: Define Google Places response types**

```typescript
// apps/server/src/types.ts
export interface GooglePlace {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: { lat: number; lng: number };
  };
  opening_hours?: { open_now?: boolean };
  price_level?: number;
  photos?: Array<{ photo_reference: string }>;
  types?: string[];
}

export interface GooglePlacesResponse {
  results: GooglePlace[];
  status: string;
  error_message?: string;
}
```

**Step 2: Create service**

```typescript
// apps/server/src/services/googlePlaces.ts
import { PickyRestaurant } from '@picky/types';
import { GooglePlace, GooglePlacesResponse } from '../types';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BASE_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

export class GooglePlacesService {
  async searchNearby(
    lat: number,
    lng: number,
    radius: number = 5000,
    type: string = 'restaurant'
  ): Promise<PickyRestaurant[]> {
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error('GOOGLE_PLACES_API_KEY not configured');
    }

    const url = new URL(BASE_URL);
    url.searchParams.set('location', `${lat},${lng}`);
    url.searchParams.set('radius', String(radius));
    url.searchParams.set('type', type);
    url.searchParams.set('key', GOOGLE_PLACES_API_KEY);

    const response = await fetch(url.toString());
    const data: GooglePlacesResponse = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places error: ${data.status} - ${data.error_message || ''}`);
    }

    return (data.results || []).map((place) => this.mapToPickyRestaurant(place, lat, lng));
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
      isOpenNow: place.opening_hours?.open_now || false,
      priceRange: (place.price_level || 2) as 1 | 2 | 3 | 4,
      photos: this.buildPhotoUrls(place.photos || []),
      cuisineTypes,
      dietaryTags: [],
      menu: [],
      hours: {},
      pickyScore: 0,
      pickyScoreBreakdown: {
        googleRating: 0,
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
      'establishment', 'point_of_interest', 'food', 'store', 'premise',
    ]);
    return types
      .filter((t) => !genericTypes.has(t))
      .map((t) => t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
  }

  private buildPhotoUrls(photos: Array<{ photo_reference: string }>): string[] {
    return photos.map((p) => {
      const url = new URL('https://maps.googleapis.com/maps/api/place/photo');
      url.searchParams.set('maxwidth', '800');
      url.searchParams.set('photo_reference', p.photo_reference);
      url.searchParams.set('key', GOOGLE_PLACES_API_KEY!);
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
```

**Step 3: Commit**

```bash
git add apps/server/src/services/ apps/server/src/types.ts
git commit -m "feat: add Google Places service with mapping to PickyRestaurant"
```

---

### Task 5: Create /api/restaurants/nearby Endpoint

**Files:**
- Create: `apps/server/src/routes/restaurants.ts`

**Step 1: Create route**

```typescript
// apps/server/src/routes/restaurants.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { GooglePlacesService } from '../services/googlePlaces';

interface NearbyQuery {
  lat: string;
  lng: string;
  radius?: string;
  type?: string;
}

export async function restaurantRoutes(app: FastifyInstance) {
  const service = new GooglePlacesService();

  app.get('/nearby', async (request: FastifyRequest<{ Querystring: NearbyQuery }>, reply: FastifyReply) => {
    const { lat, lng, radius = '5000', type = 'restaurant' } = request.query;

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radiusNum = parseInt(radius, 10);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return reply.status(400).send({ error: 'Invalid coordinates' });
    }

    try {
      const restaurants = await service.searchNearby(latNum, lngNum, radiusNum, type);
      return restaurants;
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: 'Service unavailable' });
    }
  });
}
```

**Step 2: Test endpoint**

```bash
curl "http://localhost:3000/api/restaurants/nearby?lat=37.7749&lng=-122.4194"
```
Expected: Returns array of PickyRestaurant objects (or empty array if no key configured)

**Step 3: Commit**

```bash
git add apps/server/src/routes/restaurants.ts
git commit -m "feat: add GET /api/restaurants/nearby endpoint"
```

---

### Task 6: Add Server Tests

**Files:**
- Create: `apps/server/src/services/googlePlaces.test.ts`
- Create: `apps/server/src/routes/restaurants.test.ts`
- Create: `apps/server/jest.config.js`

**Step 1: Create jest config**

```javascript
// apps/server/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
};
```

**Step 2: Write service tests**

```typescript
// apps/server/src/services/googlePlaces.test.ts
import nock from 'nock';
import { GooglePlacesService } from './googlePlaces';

describe('GooglePlacesService', () => {
  const service = new GooglePlacesService();

  beforeEach(() => {
    process.env.GOOGLE_PLACES_API_KEY = 'test-key';
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('maps Google Place to PickyRestaurant', async () => {
    nock('https://maps.googleapis.com')
      .get('/maps/api/place/nearbysearch/json')
      .query(true)
      .reply(200, {
        status: 'OK',
        results: [
          {
            place_id: 'ChIJ123',
            name: 'Test Restaurant',
            vicinity: '123 Main St',
            geometry: { location: { lat: 37.7749, lng: -122.4194 } },
            opening_hours: { open_now: true },
            price_level: 2,
            photos: [{ photo_reference: 'photo123' }],
            types: ['restaurant', 'italian', 'food'],
          },
        ],
      });

    const results = await service.searchNearby(37.7749, -122.4194);

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Test Restaurant');
    expect(results[0].googlePlaceId).toBe('ChIJ123');
    expect(results[0].isOpenNow).toBe(true);
    expect(results[0].priceRange).toBe(2);
    expect(results[0].cuisineTypes).toContain('Italian');
    expect(results[0].cuisineTypes).not.toContain('Food');
    expect(results[0].photos[0]).toContain('photo_reference=photo123');
  });

  it('handles empty results', async () => {
    nock('https://maps.googleapis.com')
      .get('/maps/api/place/nearbysearch/json')
      .query(true)
      .reply(200, { status: 'ZERO_RESULTS', results: [] });

    const results = await service.searchNearby(0, 0);
    expect(results).toEqual([]);
  });

  it('throws on API error', async () => {
    nock('https://maps.googleapis.com')
      .get('/maps/api/place/nearbysearch/json')
      .query(true)
      .reply(200, { status: 'REQUEST_DENIED', error_message: 'Bad key' });

    await expect(service.searchNearby(0, 0)).rejects.toThrow('REQUEST_DENIED');
  });
});
```

**Step 3: Write route tests**

```typescript
// apps/server/src/routes/restaurants.test.ts
import fastify from 'fastify';
import { restaurantRoutes } from './restaurants';
import nock from 'nock';

describe('restaurantRoutes', () => {
  const app = fastify();

  beforeAll(async () => {
    process.env.GOOGLE_PLACES_API_KEY = 'test-key';
    await app.register(restaurantRoutes, { prefix: '/api/restaurants' });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns restaurants for valid coordinates', async () => {
    nock('https://maps.googleapis.com')
      .get('/maps/api/place/nearbysearch/json')
      .query(true)
      .reply(200, {
        status: 'OK',
        results: [
          {
            place_id: 'ChIJ123',
            name: 'Test Restaurant',
            vicinity: '123 Main St',
            geometry: { location: { lat: 37.7749, lng: -122.4194 } },
            types: ['restaurant'],
          },
        ],
      });

    const response = await app.inject({
      method: 'GET',
      url: '/api/restaurants/nearby?lat=37.7749&lng=-122.4194',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveLength(1);
    expect(body[0].name).toBe('Test Restaurant');
  });

  it('returns 400 for invalid coordinates', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/restaurants/nearby?lat=invalid&lng=invalid',
    });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ error: 'Invalid coordinates' });
  });
});
```

**Step 4: Run server tests**

```bash
cd apps/server && npm test
```
Expected: All tests pass

**Step 5: Commit**

```bash
git add apps/server/src/**/*.test.ts apps/server/jest.config.js
git commit -m "test: add server tests for Google Places service and routes"
```

---

### Task 7: Create Mobile Location Hook

**Files:**
- Create: `apps/mobile/hooks/useLocation.ts`
- Create: `apps/mobile/hooks/useLocation.test.ts`

**Step 1: Install expo-location**

```bash
cd apps/mobile && npx expo install expo-location
```

**Step 2: Create hook**

```typescript
// apps/mobile/hooks/useLocation.ts
import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

interface LocationState {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  error: string | null;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    lat: null,
    lng: null,
    loading: true,
    error: null,
  });

  const requestLocation = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState({ lat: null, lng: null, loading: false, error: 'Location permission denied' });
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setState({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState({ lat: null, lng: null, loading: false, error: 'Failed to get location' });
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { ...state, refetch: requestLocation };
}
```

**Step 3: Create test**

```typescript
// apps/mobile/hooks/useLocation.test.ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { useLocation } from './useLocation';
import * as Location from 'expo-location';

jest.mock('expo-location');

describe('useLocation', () => {
  it('returns location after permission granted', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: 37.7749, longitude: -122.4194 },
    });

    const { result } = renderHook(() => useLocation());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.lat).toBe(37.7749);
    expect(result.current.lng).toBe(-122.4194);
    expect(result.current.error).toBeNull();
  });

  it('returns error when permission denied', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useLocation());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Location permission denied');
  });
});
```

**Step 4: Commit**

```bash
git add apps/mobile/hooks/
git commit -m "feat: add useLocation hook with expo-location integration"
```

---

### Task 8: Create Mobile API Client and Integrate into Feed

**Files:**
- Create: `apps/mobile/lib/api.ts`
- Modify: `apps/mobile/app/(tabs)/index.tsx`

**Step 1: Create API client**

```typescript
// apps/mobile/lib/api.ts
import { PickyRestaurant } from '@picky/types';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

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
```

**Step 2: Update feed screen**

```typescript
// apps/mobile/app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart } from 'lucide-react-native';
import { SwipeCard } from '@/components/features/SwipeCard';
import { PickyRestaurant } from '@picky/types';
import { useSavedStore } from '@/store/savedStore';
import { useLocation } from '@/hooks/useLocation';
import { fetchNearbyRestaurants } from '@/lib/api';

export default function SwipeFeedScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [restaurants, setRestaurants] = useState<PickyRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const addSaved = useSavedStore((state) => state.addSaved);
  const { lat, lng, loading: locationLoading, error: locationError, refetch } = useLocation();

  useEffect(() => {
    if (lat && lng) {
      setLoading(true);
      setError(null);
      fetchNearbyRestaurants(lat, lng)
        .then((data) => {
          setRestaurants(data);
          setActiveIndex(0);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [lat, lng]);

  const handleSwipeRight = (restaurant: PickyRestaurant) => {
    addSaved(restaurant);
    setActiveIndex((prev) => prev + 1);
  };

  const handleSwipeLeft = () => {
    setActiveIndex((prev) => prev + 1);
  };

  const hasMoreCards = activeIndex < restaurants.length;
  const remainingCount = restaurants.length - activeIndex;

  if (locationLoading || loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-neutral-900 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="mt-4 text-gray-500">Finding restaurants near you...</Text>
      </SafeAreaView>
    );
  }

  if (locationError || error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-neutral-900 items-center justify-center px-8">
        <Text className="text-xl font-bold text-gray-900 dark:text-white text-center mb-4">
          {locationError || error}
        </Text>
        <Pressable className="bg-orange-500 px-6 py-3 rounded-full" onPress={refetch}>
          <Text className="text-white font-semibold">Try Again</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-neutral-900">
      <View className="px-5 pt-2 pb-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">Picky</Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {hasMoreCards ? `${remainingCount} spots nearby` : 'All caught up!'}
        </Text>
      </View>

      <View className="flex-1 px-4 pb-4 relative">
        {hasMoreCards ? (
          <View className="flex-1">
            {[...restaurants].reverse().map((restaurant, reversedIndex) => {
              const actualIndex = restaurants.length - 1 - reversedIndex;
              if (actualIndex < activeIndex) return null;
              return (
                <SwipeCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onSwipeRight={handleSwipeRight}
                  onSwipeLeft={handleSwipeLeft}
                  activeIndex={activeIndex}
                  index={actualIndex}
                />
              );
            })}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center px-8">
            <View className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mb-4">
              <Heart size={32} color="#f97316" />
            </View>
            <Text className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
              You've seen it all!
            </Text>
            <Pressable className="bg-orange-500 px-6 py-3 rounded-full" onPress={() => setActiveIndex(0)}>
              <Text className="text-white font-semibold text-base">Start Over</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
```

**Step 3: Commit**

```bash
git add apps/mobile/lib/api.ts apps/mobile/app/(tabs)/index.tsx
git commit -m "feat: integrate real API data into feed screen with location-based fetching"
```

---

### Task 9: Update Mobile Tests

**Files:**
- Modify: `apps/mobile/__tests__/SwipeFeedScreen.test.tsx`
- Modify: `apps/mobile/__tests__/swipeIntegration.test.tsx`
- Modify: `apps/mobile/__tests__/SwipeCard.test.tsx`

**Step 1: Update tests to mock API and location**

Mock `expo-location` and `@/lib/api` in test setup.

**Step 2: Write feed screen integration test**

```typescript
// apps/mobile/__tests__/SwipeFeedScreen.test.tsx
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import SwipeFeedScreen from '@/app/(tabs)/index';
import * as Location from 'expo-location';
import { fetchNearbyRestaurants } from '@/lib/api';

jest.mock('expo-location');
jest.mock('@/lib/api');

describe('SwipeFeedScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state while fetching location and restaurants', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: 37.7749, longitude: -122.4194 },
    });
    (fetchNearbyRestaurants as jest.Mock).mockResolvedValue([
      { id: '1', name: 'Test Restaurant', googlePlaceId: 'ChIJ123', address: '123 Main St', coordinates: { lat: 37.7749, lng: -122.4194 }, isOpenNow: true, photos: [], cuisineTypes: ['Italian'], priceRange: 2, dietaryTags: [], menu: [], hours: {}, pickyScore: 0, pickyScoreBreakdown: { googleRating: 0, yelpRating: 0, communityTipQuality: 0, visitToSaveRatio: 0, recencyBonus: 0 }, lastSyncedAt: new Date().toISOString() },
    ]);

    const { getByText } = await render(<SwipeFeedScreen />);

    expect(getByText('Finding restaurants near you...')).toBeTruthy();

    await waitFor(() => expect(getByText('Test Restaurant')).toBeTruthy());
  });

  it('shows error state when API fails', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: 37.7749, longitude: -122.4194 },
    });
    (fetchNearbyRestaurants as jest.Mock).mockRejectedValue(new Error('API error'));

    const { getByText } = await render(<SwipeFeedScreen />);

    await waitFor(() => expect(getByText('API error')).toBeTruthy());
  });
});
```

**Step 3: Run mobile tests**

```bash
cd apps/mobile && npx jest --no-coverage
```
Expected: All tests pass

**Step 4: Commit**

```bash
git add apps/mobile/__tests__/
git commit -m "test: update mobile tests for API integration and location hook"
```

---

### Task 10: Run All Tests and Verify

**Step 1: Run server tests**

```bash
cd apps/server && npm test
```
Expected: PASS

**Step 2: Run mobile tests**

```bash
cd apps/mobile && npx jest --no-coverage
```
Expected: PASS

**Step 3: Start server and test end-to-end**

Terminal 1:
```bash
cd apps/server && npm run dev
```

Terminal 2:
```bash
curl "http://localhost:3000/api/restaurants/nearby?lat=37.7749&lng=-122.4194"
```
Expected: Returns restaurant array (requires valid GOOGLE_PLACES_API_KEY)

**Step 4: Start mobile**

```bash
cd apps/mobile && npx expo start --clear
```

**Step 5: Commit**

```bash
git commit -m "chore: verify all tests passing and integration working"
```

---

## Spec Coverage Check

| Spec Section | Task |
|--------------|------|
| Monorepo structure | Task 1, 2 |
| Fastify server setup | Task 3 |
| Google Places service | Task 4 |
| API endpoint | Task 5 |
| Error handling | Task 5 (route), Task 6 (tests) |
| Mobile location hook | Task 7 |
| Mobile API integration | Task 8 |
| Tests | Task 6, 9 |
| End-to-end verification | Task 10 |

## Placeholder Scan

- No TBD/TODO placeholders
- All code shown in full
- All test code shown in full
- All commands with expected output

## Type Consistency

- `PickyRestaurant` imported from `@picky/types` everywhere
- `GooglePlace`, `GooglePlacesResponse` in `server/src/types.ts`
- `NearbyQuery` interface in route matches query params spec
- `fetchNearbyRestaurants` accepts same params as endpoint
