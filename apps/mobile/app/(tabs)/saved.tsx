import React from 'react';
import { View, Text, Pressable, FlatList, SafeAreaView, Image } from 'react-native';
import { Trash2, MapPin, ChevronRight } from 'lucide-react-native';
import { useSavedStore } from '@/store/savedStore';
import { PickyScoreBadge } from '@/components/ui/PickyScoreBadge';
import { router } from 'expo-router';

export default function SavedScreen() {
  const { saved, removeSaved } = useSavedStore();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-neutral-900">
      {/* Header */}
      <View className="px-4 pt-3 pb-5">
        <Text className="text-3xl font-bold text-gray-900 dark:text-white">Saved</Text>
        <Text className="text-base text-gray-500 dark:text-gray-400 mt-2">
          {saved.length} restaurant{saved.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {saved.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center mb-6">
            <MapPin size={32} color="#9ca3af" />
          </View>
          <Text className="text-gray-900 dark:text-white text-xl font-semibold text-center mb-3">
            No saved restaurants
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center text-base leading-6">
            Swipe right on restaurants you like to save them here
          </Text>
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/restaurant/${item.id}`)}
              className="bg-white dark:bg-neutral-800 rounded-2xl p-4 mb-4 shadow-sm flex-row items-center active:opacity-70"
              accessibilityLabel={`View details for ${item.name}`}
              accessibilityRole="button"
            >
              {/* Photo thumbnail */}
              {item.photos[0] ? (
                <Image
                  source={{ uri: item.photos[0] }}
                  className="w-16 h-16 rounded-xl mr-4"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-neutral-700 mr-4 items-center justify-center">
                  <MapPin size={24} color="#9ca3af" />
                </View>
              )}

              {/* Content */}
              <View className="flex-1 mr-2">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-1" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className="text-base text-gray-500 dark:text-gray-400 mb-1" numberOfLines={1}>
                  {item.cuisineTypes.join(' • ')} • {'$'.repeat(item.priceRange)}
                </Text>
                <View className="flex-row items-center">
                  <MapPin size={14} color="#9ca3af" />
                  <Text className="text-sm text-gray-400 dark:text-gray-500 ml-1.5 flex-1" numberOfLines={1}>
                    {item.address}
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View className="flex-row items-center ml-2">
                <View className="flex-col items-end">
                  <PickyScoreBadge score={item.pickyScore} size="sm" />
                  <View className="flex-row items-center mt-2">
                    <Pressable
                      onPress={() => removeSaved(item.id)}
                      className="p-2"
                      accessibilityLabel={`Remove ${item.name}`}
                      accessibilityRole="button"
                      hitSlop={12}
                    >
                      <Trash2 size={20} color="#f87171" />
                    </Pressable>
                    <ChevronRight size={20} color="#9ca3af" />
                  </View>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
