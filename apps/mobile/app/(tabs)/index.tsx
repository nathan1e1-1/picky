import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart } from 'lucide-react-native';
import { router } from 'expo-router';
import { SwipeCard } from '@/components/features/SwipeCard';
import { PickyRestaurant } from '@picky/types';
import { useSavedStore } from '@/store/savedStore';
import { useLocation } from '@/hooks/useLocation';
import { fetchNearbyRestaurants, jitterCoordinates } from '@/lib/api';
import { mockRestaurants } from '@/lib/mockData';
import { Button } from '@/components/ui/Button';

export default function SwipeFeedScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [restaurants, setRestaurants] = useState<PickyRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const addSaved = useSavedStore((state) => state.addSaved);
  const { lat, lng, loading: locationLoading, error: locationError, refetch: refetchLocation } = useLocation();

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

  const handleSwipeRight = useCallback(
    (restaurant: PickyRestaurant) => {
      addSaved(restaurant);
      setActiveIndex((prev) => prev + 1);
    },
    [addSaved]
  );

  const handleSwipeLeft = useCallback(() => {
    setActiveIndex((prev) => prev + 1);
  }, []);

  const handleReset = useCallback(() => {
    setActiveIndex(0);
  }, []);

  const handleTap = useCallback((restaurant: PickyRestaurant) => {
    router.push(`/restaurant/${encodeURIComponent(restaurant.id)}`);
  }, []);

  const handleFindMore = useCallback(() => {
    if (lat && lng) {
      setLoading(true);
      setError(null);
      const { lat: jitteredLat, lng: jitteredLng } = jitterCoordinates(lat, lng);
      fetchNearbyRestaurants(jitteredLat, jitteredLng)
        .then((data) => {
          setRestaurants(data);
          setActiveIndex(0);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [lat, lng]);

  const handleUseDemoData = useCallback(() => {
    setRestaurants(mockRestaurants);
    setActiveIndex(0);
    setError(null);
  }, []);

  const hasMoreCards = activeIndex < restaurants.length;
  const remainingCount = restaurants.length - activeIndex;

  if (locationLoading || loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-neutral-900 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="mt-4 text-gray-500 dark:text-gray-400">
          Finding restaurants near you...
        </Text>
      </SafeAreaView>
    );
  }

  if (locationError || error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-neutral-900 items-center justify-center px-8">
        <Text className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
          {locationError || error}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          Server: {process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.111:3000'}
        </Text>
        <Button
          variant="primary"
          onPress={() => {
            if (locationError) {
              refetchLocation();
            } else {
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
            }
          }}
        >
          Try Again
        </Button>
        <Button
          variant="secondary"
          onPress={handleUseDemoData}
        >
          Use Demo Data
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-neutral-900">
      {/* Header */}
      <View className="px-4 pt-2 pb-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">Picky</Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {hasMoreCards ? `${remainingCount} spots nearby` : 'All caught up!'}
        </Text>
      </View>

      {/* Card Stack */}
      <View className="flex-1 px-4 pb-4 relative">
        {hasMoreCards ? (
          <View className="flex-1">
            {/* Render cards in reverse order so the first card is on top */}
            {[...restaurants].reverse().map((restaurant, reversedIndex) => {
              const actualIndex = restaurants.length - 1 - reversedIndex;
              if (actualIndex < activeIndex) return null;
              return (
                <SwipeCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onSwipeRight={handleSwipeRight}
                  onSwipeLeft={handleSwipeLeft}
                  onTap={handleTap}
                  activeIndex={activeIndex}
                  index={actualIndex}
                />
              );
            })}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center px-8">
            <View className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mb-4">
              <Heart size={28} color="#f97316" />
            </View>
            <Text className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">
              You've seen it all!
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center text-sm mb-6">
              Check back later for more restaurant recommendations near you.
            </Text>
            <View className="w-full space-y-4">
              <Button
                variant="primary"
                onPress={handleFindMore}
              >
                Find More Restaurants
              </Button>
              <Button
                variant="secondary"
                onPress={handleReset}
              >
                Start Over
              </Button>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
