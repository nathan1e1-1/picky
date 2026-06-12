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
      <View className="px-4 pt-2 pb-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">Saved</Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {saved.length} restaurant{saved.length !== 1 ? 's' : ''} saved
        </Text>
      </View>

      {saved.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-16 h-16 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center mb-4">
            <MapPin size={28} color="#9ca3af" />
          </View>
          <Text className="text-gray-900 dark:text-white text-lg font-semibold text-center mb-2">
            No saved restaurants yet
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center text-sm">
            Swipe right on restaurants you like to save them here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/restaurant/${item.id}`)}
              className="bg-white dark:bg-neutral-800 rounded-xl p-4 mb-3 shadow-sm flex-row items-center active:opacity-70"
              accessibilityLabel={`View details for ${item.name}`}
              accessibilityRole="button"
            >
              {/* Photo thumbnail */}
              {item.photos[0] ? (
                <Image
                  source={{ uri: item.photos[0] }}
                  className="w-14 h-14 rounded-xl mr-4"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-neutral-700 mr-4 items-center justify-center">
                  <MapPin size={20} color="#9ca3af" />
                </View>
              )}

              {/* Content */}
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-base font-semibold text-gray-900 dark:text-white flex-1 mr-2" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <PickyScoreBadge score={item.pickyScore} size="sm" />
                </View>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1" numberOfLines={1}>
                  {item.cuisineTypes.join(' • ')} • {'$'.repeat(item.priceRange)}
                </Text>
                <View className="flex-row items-center">
                  <MapPin size={12} color="#9ca3af" />
                  <Text className="text-xs text-gray-400 dark:text-gray-500 ml-1 flex-1" numberOfLines={1}>
                    {item.address}
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View className="flex-row items-center ml-3">
                <Pressable
                  onPress={() => removeSaved(item.id)}
                  className="p-2"
                  accessibilityLabel={`Remove ${item.name}`}
                  accessibilityRole="button"
                  hitSlop={8}
                >
                  <Trash2 size={18} color="#f87171" />
                </Pressable>
                <ChevronRight size={18} color="#9ca3af" />
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
