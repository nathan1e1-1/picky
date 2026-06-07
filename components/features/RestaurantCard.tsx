import React from 'react';
import { View, Text, Image, useWindowDimensions, Pressable } from 'react-native';
import { Clock, MapPin, DollarSign } from 'lucide-react-native';
import { PickyRestaurant } from '@/types/restaurant';
import { PickyScoreBadge } from '@/components/ui/PickyScoreBadge';

interface RestaurantCardProps {
  restaurant: PickyRestaurant;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const priceSymbols = '$'.repeat(restaurant.priceRange);

  return (
    <View className="flex-1 rounded-3xl overflow-hidden bg-white dark:bg-neutral-800 shadow-lg">
      {/* Image */}
      <View className="relative h-[55%]">
        <Image
          source={{ uri: restaurant.photos[0] }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute top-4 right-4">
          <PickyScoreBadge score={restaurant.pickyScore} size="lg" />
        </View>
        <View className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
      </View>

      {/* Content */}
      <View className="flex-1 px-5 py-4">
        {/* Name */}
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2" numberOfLines={2}>
          {restaurant.name}
        </Text>

        {/* Cuisine Tags */}
        <View className="flex-row flex-wrap gap-2 mb-3">
          {restaurant.cuisineTypes.map((cuisine) => (
            <View
              key={cuisine}
              className="bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full"
            >
              <Text className="text-orange-700 dark:text-orange-300 text-xs font-medium">
                {cuisine}
              </Text>
            </View>
          ))}
          {restaurant.dietaryTags.slice(0, 2).map((tag) => (
            <View
              key={tag}
              className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full"
            >
              <Text className="text-green-700 dark:text-green-300 text-xs font-medium">
                {tag}
              </Text>
            </View>
          ))}
        </View>

        {/* Info Row */}
        <View className="space-y-2">
          <View className="flex-row items-center">
            <MapPin size={16} color="#6b7280" style={{ marginRight: 8 }} />
            <Text className="text-gray-600 dark:text-gray-300 text-sm flex-1" numberOfLines={1}>
              {restaurant.address}
            </Text>
            {restaurant.distance && (
              <Text className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                {restaurant.distance}
              </Text>
            )}
          </View>

          <View className="flex-row items-center">
            <Clock size={16} color="#6b7280" style={{ marginRight: 8 }} />
            <Text
              className={`text-sm font-medium ${
                restaurant.isOpenNow
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-500 dark:text-red-400'
              }`}
            >
              {restaurant.isOpenNow ? 'Open Now' : 'Closed'}
            </Text>
          </View>

          <View className="flex-row items-center">
            <DollarSign size={16} color="#6b7280" style={{ marginRight: 8 }} />
            <Text className="text-gray-600 dark:text-gray-300 text-sm">{priceSymbols}</Text>
          </View>
        </View>

        {/* Picky Score Breakdown hint */}
        <View className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
          <Text className="text-xs text-gray-400 dark:text-gray-500">
            Tap the score to see how Picky rates this spot
          </Text>
        </View>
      </View>
    </View>
  );
}
