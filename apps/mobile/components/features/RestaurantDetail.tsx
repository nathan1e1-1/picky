import React from 'react';
import { View, Text, Image, Pressable, ScrollView, Linking } from 'react-native';
import { MapPin, Phone, Globe, Clock, Star, ArrowLeft } from 'lucide-react-native';
import { PickyScoreBadge } from '@/components/ui/PickyScoreBadge';
import { PlaceDetails } from '@/lib/api';

interface RestaurantDetailProps {
  details: PlaceDetails;
  onBack: () => void;
}

export function RestaurantDetail({ details, onBack }: RestaurantDetailProps) {
  return (
    <View className="flex-1 bg-white dark:bg-neutral-900">
      {/* Header Image */}
      <View className="relative h-[35%]">
        {details.photos[0] ? (
          <Image source={{ uri: details.photos[0] }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="w-full h-full bg-gray-200 dark:bg-neutral-800 items-center justify-center">
            <Text className="text-gray-400">No photo available</Text>
          </View>
        )}
        <Pressable
          className="absolute top-12 left-4 w-10 h-10 rounded-full bg-black/50 items-center justify-center"
          onPress={onBack}
        >
          <ArrowLeft size={20} color="white" />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-5 pt-4">
        {/* Name & Score */}
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white flex-1 mr-2" numberOfLines={2}>
            {details.name}
          </Text>
          <PickyScoreBadge score={Math.round(details.googleRating * 20)} size="lg" />
        </View>

        {/* Rating */}
        <View className="flex-row items-center mb-4">
          <Star size={16} color="#fbbf24" fill="#fbbf24" />
          <Text className="text-sm text-gray-600 dark:text-gray-300 ml-1">
            {details.googleRating} ({details.reviewCount} reviews)
          </Text>
        </View>

        {/* Info Items */}
        <View className="space-y-3 mb-6">
          <View className="flex-row items-center">
            <MapPin size={18} color="#6b7280" />
            <Text className="text-gray-700 dark:text-gray-300 ml-3 flex-1">{details.address}</Text>
          </View>

          {details.phone && (
            <Pressable className="flex-row items-center" onPress={() => Linking.openURL(`tel:${details.phone}`)}>
              <Phone size={18} color="#6b7280" />
              <Text className="text-blue-600 dark:text-blue-400 ml-3">{details.phone}</Text>
            </Pressable>
          )}

          {details.website && (
            <Pressable className="flex-row items-center" onPress={() => Linking.openURL(details.website!)}>
              <Globe size={18} color="#6b7280" />
              <Text className="text-blue-600 dark:text-blue-400 ml-3" numberOfLines={1}>{details.website}</Text>
            </Pressable>
          )}

          <View className="flex-row items-center">
            <Clock size={18} color={details.isOpenNow ? '#22c55e' : '#ef4444'} />
            <Text className={`ml-3 font-medium ${details.isOpenNow ? 'text-green-600' : 'text-red-500'}`}>
              {details.isOpenNow ? 'Open Now' : 'Closed'}
            </Text>
          </View>
        </View>

        {/* Hours */}
        {Object.keys(details.hours).length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Hours</Text>
            {Object.entries(details.hours).map(([day, hours]) => (
              <View key={day} className="flex-row justify-between py-1">
                <Text className="text-gray-600 dark:text-gray-400 capitalize">{day}</Text>
                <Text className="text-gray-900 dark:text-white">{hours}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
