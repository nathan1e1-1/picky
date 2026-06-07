import React, { useState, useCallback, useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, X, Zap } from 'lucide-react-native';
import { SwipeCard, SwipeCardRef } from '@/components/features/SwipeCard';
import { mockRestaurants } from '@/lib/mockData';
import { PickyRestaurant } from '@/types/restaurant';
import { useSavedStore } from '@/store/savedStore';

export default function SwipeFeedScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [restaurants, setRestaurants] = useState<PickyRestaurant[]>(mockRestaurants);
  const addSaved = useSavedStore((state) => state.addSaved);
  const cardRef = useRef<SwipeCardRef>(null);

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

  const handleButtonSwipe = useCallback(
    (direction: 'left' | 'right') => {
      if (activeIndex >= restaurants.length) return;
      if (cardRef.current) {
        if (direction === 'right') {
          cardRef.current.swipeRight();
        } else {
          cardRef.current.swipeLeft();
        }
      }
    },
    [activeIndex, restaurants.length]
  );

  const handleReset = useCallback(() => {
    setActiveIndex(0);
    setRestaurants((prev) => [...prev]);
  }, []);

  const hasMoreCards = activeIndex < restaurants.length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-neutral-900">
      {/* Header */}
      <View className="px-5 pt-2 pb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">Picky</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {hasMoreCards ? `${restaurants.length - activeIndex} spots nearby` : 'All caught up!'}
          </Text>
        </View>
        <Pressable
          className="bg-orange-500 px-4 py-2 rounded-full flex-row items-center"
          onPress={() => {/* Navigate to Emergency Mode */}}
        >
          <Zap size={16} color="white" />
          <Text className="text-white font-semibold ml-1 text-sm">Emergency</Text>
        </Pressable>
      </View>

      {/* Card Stack */}
      <View className="flex-1 px-4 pb-4">
        {hasMoreCards ? (
          <View className="flex-1">
            {/* Render cards in reverse order so the first card is on top */}
            {[...restaurants].reverse().map((restaurant, reversedIndex) => {
              const actualIndex = restaurants.length - 1 - reversedIndex;
              if (actualIndex < activeIndex) return null;
              return (
                <SwipeCard
                  key={restaurant.id}
                  ref={actualIndex === activeIndex ? cardRef : undefined}
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
            <Text className="text-gray-500 dark:text-gray-400 text-center mb-6">
              Check back later for more restaurant recommendations near you.
            </Text>
            <Pressable
              className="bg-orange-500 px-6 py-3 rounded-full"
              onPress={handleReset}
            >
              <Text className="text-white font-semibold text-base">Start Over</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {hasMoreCards && (
        <View className="flex-row items-center justify-center gap-6 pb-6 px-4">
          <Pressable
            className="w-16 h-16 rounded-full bg-white dark:bg-neutral-800 shadow-md items-center justify-center border border-gray-100 dark:border-gray-700"
            onPress={() => handleButtonSwipe('left')}
            accessibilityLabel="Dismiss restaurant"
            accessibilityRole="button"
          >
            <X size={28} color="#ef4444" />
          </Pressable>

          <Pressable
            className="w-16 h-16 rounded-full bg-white dark:bg-neutral-800 shadow-md items-center justify-center border border-gray-100 dark:border-gray-700"
            onPress={() => handleButtonSwipe('right')}
            accessibilityLabel="Save restaurant"
            accessibilityRole="button"
          >
            <Heart size={28} color="#22c55e" />
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
