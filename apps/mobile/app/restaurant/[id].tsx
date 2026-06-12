import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { RestaurantDetail } from '@/components/features/RestaurantDetail';
import { fetchPlaceDetails, PlaceDetails } from '@/lib/api';
import { useSavedStore } from '@/store/savedStore';
import { PickyRestaurant } from '@picky/types';

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<PickyRestaurant | null>(null);
  const [details, setDetails] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    // Check saved store first
    const savedRestaurant = useSavedStore.getState().getById(id);
    const hasEmptyHours = !savedRestaurant || Object.keys(savedRestaurant.hours).length === 0;

    if (savedRestaurant && !hasEmptyHours) {
      // Saved restaurant has complete data including hours
      setRestaurant(savedRestaurant);
      setLoading(false);
      return;
    }

    // Fetch from server if not saved or if hours are missing
    fetchPlaceDetails(id)
      .then((d) => {
        setDetails(d);
        // Convert PlaceDetails to PickyRestaurant shape for the detail component
        // Server PlaceDetails only has basic fields; fill missing ones with defaults
        const converted: PickyRestaurant = {
          id: d.placeId,
          googlePlaceId: d.placeId,
          name: d.name,
          address: d.address,
          coordinates: { lat: 0, lng: 0 },
          phone: d.phone,
          website: d.website,
          hours: d.hours,
          isOpenNow: d.isOpenNow,
          photos: d.photos,
          cuisineTypes: [],
          priceRange: 2,
          pickyScore: Math.round(d.googleRating * 20),
          pickyScoreBreakdown: {
            googleRating: d.googleRating,
            yelpRating: 0,
            communityTipQuality: 0,
            visitToSaveRatio: 0,
            recencyBonus: 0,
          },
          menu: [],
          dietaryTags: [],
          lastSyncedAt: new Date().toISOString(),
        };
        setRestaurant(converted);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-neutral-900 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="mt-4 text-gray-500 dark:text-gray-400">Loading details...</Text>
      </View>
    );
  }

  if (error || !restaurant) {
    return (
      <View className="flex-1 bg-white dark:bg-neutral-900 items-center justify-center px-8">
        <Text className="text-xl font-bold text-gray-900 dark:text-white text-center mb-4">
          {error || 'Not found'}
        </Text>
        <Pressable className="bg-orange-500 px-6 py-3 rounded-full" onPress={() => router.back()}>
          <Text className="text-white font-semibold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return <RestaurantDetail restaurant={restaurant} onBack={() => router.back()} />;
}
