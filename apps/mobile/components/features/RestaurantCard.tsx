import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { MapPin, Clock } from 'lucide-react-native';
import { PickyRestaurant } from '@picky/types';
import { PickyScoreBadge } from '@/components/ui/PickyScoreBadge';

interface RestaurantCardProps {
  restaurant: PickyRestaurant;
}

function toTitleCase(str: string): string {
  return str
    .split(/[-\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('-');
}

function PriceIndicator({ level }: { level: number }) {
  const dots = Array.from({ length: 4 }, (_, i) => i < level);
  return (
    <View className="flex-row items-center gap-1">
      {dots.map((filled, i) => (
        <View
          key={i}
          className="rounded-full"
          style={{
            width: 6,
            height: 6,
            backgroundColor: filled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
          }}
        />
      ))}
    </View>
  );
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  // Show max 3 tags: all cuisine types up to 2, then dietary to fill
  const cuisineTags = restaurant.cuisineTypes.slice(0, 2).map(toTitleCase);
  const dietaryTags = restaurant.dietaryTags
    .slice(0, Math.max(0, 3 - cuisineTags.length))
    .map(toTitleCase);
  const tags = [...cuisineTags, ...dietaryTags];

  return (
    <View
      className="flex-1 rounded-3xl overflow-hidden"
      style={styles.container}
    >
      {/* Full-bleed Image */}
      <Image
        source={{ uri: restaurant.photos[0] }}
        className="absolute inset-0 w-full h-full"
        resizeMode="cover"
      />

      {/* Dark overlay for text readability */}
      <View style={styles.overlay} pointerEvents="none" />

      {/* Score Badge - top right */}
      <View className="absolute top-4 right-4 z-10">
        <PickyScoreBadge score={restaurant.pickyScore} size="lg" />
      </View>

      {/* Content overlay at bottom */}
      <View className="absolute bottom-0 left-0 right-0 p-5 z-10">
        <Text
          className="text-white text-2xl font-bold mb-2"
          numberOfLines={2}
          style={styles.textShadow}
        >
          {restaurant.name}
        </Text>

        {/* Info Row: distance + price + open status */}
        <View className="flex-row items-center mb-3" style={styles.textShadow}>
          {restaurant.distance && (
            <View className="flex-row items-center mr-4">
              <MapPin size={14} color="rgba(255,255,255,0.8)" />
              <Text className="text-white/80 text-sm ml-1">{restaurant.distance}</Text>
            </View>
          )}
          <View className="flex-row items-center mr-4">
            <PriceIndicator level={restaurant.priceRange} />
          </View>
          <View className="flex-row items-center">
            <Clock size={14} color={restaurant.isOpenNow ? '#86efac' : '#fca5a5'} />
            <Text
              className={`text-sm ml-1 font-medium ${
                restaurant.isOpenNow ? 'text-green-300' : 'text-red-300'
              }`}
            >
              {restaurant.isOpenNow ? 'Open Now' : 'Closed'}
            </Text>
          </View>
        </View>

        {/* Tags */}
        {tags.length > 0 && (
          <View className="flex-row flex-wrap gap-2">
            {tags.map((tag) => (
              <View
                key={tag}
                className="px-3 py-1 rounded-full"
                style={styles.tagBackground}
              >
                <Text className="text-white text-xs font-medium">{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  textShadow: {
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  tagBackground: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
});
