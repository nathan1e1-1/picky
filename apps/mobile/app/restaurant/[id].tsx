import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { RestaurantDetail } from '@/components/features/RestaurantDetail';
import { fetchPlaceDetails, PlaceDetails } from '@/lib/api';

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [details, setDetails] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetchPlaceDetails(id)
      .then(setDetails)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-neutral-900 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="mt-4 text-gray-500">Loading details...</Text>
      </View>
    );
  }

  if (error || !details) {
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

  return <RestaurantDetail details={details} onBack={() => router.back()} />;
}
