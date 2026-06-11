import React from 'react';
import { View, Text, Pressable, FlatList, SafeAreaView } from 'react-native';
import { Trash2, MapPin, ChevronRight } from 'lucide-react-native';
import { useSavedStore } from '@/store/savedStore';
import { PickyScoreBadge } from '@/components/ui/PickyScoreBadge';
import { router } from 'expo-router';

export default function SavedScreen() {
  const { saved, removeSaved } = useSavedStore();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-neutral-900">
      <View className="px-5 pt-2 pb-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">Saved</Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {saved.length} restaurant{saved.length !== 1 ? 's' : ''} saved
        </Text>
      </View>

      {saved.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-gray-400 dark:text-gray-500 text-lg text-center mb-2">
            No saved restaurants yet
          </Text>
          <Text className="text-gray-400 dark:text-gray-500 text-center">
            Swipe right on restaurants you like to save them here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/restaurant/${item.id}`)}
              className="bg-white dark:bg-neutral-800 rounded-2xl p-4 mb-3 shadow-sm flex-row items-center active:opacity-70"
              accessibilityLabel={`View details for ${item.name}`}
              accessibilityRole="button"
            >
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="text-base font-semibold text-gray-900 dark:text-white flex-1">
                    {item.name}
                  </Text>
                  <PickyScoreBadge score={item.pickyScore} size="sm" />
                </View>
                <View className="flex-row items-center">
                  <MapPin size={14} color="#9ca3af" style={{ marginRight: 4 }} />
                  <Text className="text-sm text-gray-500 dark:text-gray-400 flex-1" numberOfLines={1}>
                    {item.address}
                  </Text>
                </View>
                <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {item.cuisineTypes.join(' \u2022 ')} {'\u2022'} {'$'.repeat(item.priceRange)}
                </Text>
              </View>
              <View className="flex-row items-center ml-3">
                <Pressable
                  onPress={() => removeSaved(item.id)}
                  className="p-2"
                  accessibilityLabel={`Remove ${item.name}`}
                  accessibilityRole="button"
                  hitSlop={8}
                >
                  <Trash2 size={20} color="#f87171" />
                </Pressable>
                <ChevronRight size={18} color="#9ca3af" className="ml-1" />
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
