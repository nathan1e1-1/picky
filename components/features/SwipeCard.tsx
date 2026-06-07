import React, { useCallback, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  Extrapolation,
} from 'react-native-reanimated';
import { PickyRestaurant } from '@/types/restaurant';
import { RestaurantCard } from './RestaurantCard';

export interface SwipeCardRef {
  swipeRight: () => void;
  swipeLeft: () => void;
}

interface SwipeCardProps {
  restaurant: PickyRestaurant;
  onSwipeRight: (restaurant: PickyRestaurant) => void;
  onSwipeLeft: (restaurant: PickyRestaurant) => void;
  activeIndex: number;
  index: number;
}

const SWIPE_THRESHOLD = 120;
const SWIPE_OUT_DURATION = 250;

export const SwipeCard = forwardRef<SwipeCardRef, SwipeCardProps>(
  function SwipeCard({ restaurant, onSwipeRight, onSwipeLeft, activeIndex, index }, ref) {
    const { width } = useWindowDimensions();
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const rotate = useSharedValue(0);

    const isActive = activeIndex === index;
    const isNext = activeIndex + 1 === index;

    const handleSwipeComplete = useCallback(
      (direction: 'left' | 'right') => {
        if (direction === 'right') {
          onSwipeRight(restaurant);
        } else {
          onSwipeLeft(restaurant);
        }
      },
      [onSwipeRight, onSwipeLeft, restaurant]
    );

    const triggerSwipe = useCallback(
      (direction: 'left' | 'right') => {
        if (direction === 'right') {
          translateX.value = withTiming(width * 1.5, { duration: SWIPE_OUT_DURATION }, () => {
            runOnJS(handleSwipeComplete)('right');
          });
        } else {
          translateX.value = withTiming(-width * 1.5, { duration: SWIPE_OUT_DURATION }, () => {
            runOnJS(handleSwipeComplete)('left');
          });
        }
        translateY.value = withTiming(0, { duration: SWIPE_OUT_DURATION });
      },
      [width, translateX, translateY, handleSwipeComplete]
    );

    useImperativeHandle(ref, () => ({
      swipeRight: () => triggerSwipe('right'),
      swipeLeft: () => triggerSwipe('left'),
    }));

    const gesture = Gesture.Pan()
      .enabled(isActive)
      .onBegin(() => {
        rotate.value = withSpring(0);
      })
      .onUpdate((event) => {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
        rotate.value = interpolate(
          event.translationX,
          [-width / 2, 0, width / 2],
          [-15, 0, 15],
          Extrapolation.CLAMP
        );
      })
      .onEnd((event) => {
        if (event.translationX > SWIPE_THRESHOLD) {
          translateX.value = withTiming(width * 1.5, { duration: SWIPE_OUT_DURATION }, () => {
            runOnJS(handleSwipeComplete)('right');
          });
          translateY.value = withTiming(0, { duration: SWIPE_OUT_DURATION });
        } else if (event.translationX < -SWIPE_THRESHOLD) {
          translateX.value = withTiming(-width * 1.5, { duration: SWIPE_OUT_DURATION }, () => {
            runOnJS(handleSwipeComplete)('left');
          });
          translateY.value = withTiming(0, { duration: SWIPE_OUT_DURATION });
        } else {
          translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
          translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
          rotate.value = withSpring(0);
        }
      });

    const cardStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        activeIndex,
        [index - 1, index],
        [0.95, 1],
        Extrapolation.CLAMP
      );

      const opacity = interpolate(
        activeIndex,
        [index - 1, index, index + 1],
        [0.5, 1, 0],
        Extrapolation.CLAMP
      );

      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { rotateZ: `${rotate.value}deg` },
          { scale: isActive ? 1 : isNext ? 0.95 : scale },
        ],
        opacity: isActive || isNext ? 1 : opacity,
      };
    });

    const likeStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        translateX.value,
        [0, SWIPE_THRESHOLD],
        [0, 1],
        Extrapolation.CLAMP
      );
      const scale = interpolate(
        translateX.value,
        [0, SWIPE_THRESHOLD],
        [0.5, 1],
        Extrapolation.CLAMP
      );

      return {
        opacity,
        transform: [{ scale }, { rotateZ: '-15deg' }],
      };
    });

    const nopeStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        translateX.value,
        [-SWIPE_THRESHOLD, 0],
        [1, 0],
        Extrapolation.CLAMP
      );
      const scale = interpolate(
        translateX.value,
        [-SWIPE_THRESHOLD, 0],
        [1, 0.5],
        Extrapolation.CLAMP
      );

      return {
        opacity,
        transform: [{ scale }, { rotateZ: '15deg' }],
      };
    });

    return (
      <View className="absolute inset-0" style={{ zIndex: 100 - index }}>
        <GestureDetector gesture={gesture}>
          <Animated.View className="flex-1 rounded-3xl overflow-hidden" style={[styles.card, cardStyle]}>
            <RestaurantCard restaurant={restaurant} />

            {/* Like Stamp */}
            <Animated.View
              className="absolute top-8 left-8 border-4 border-green-500 rounded-lg px-4 py-2"
              style={[likeStyle]}
              pointerEvents="none"
            >
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                <Text className="text-green-500 font-black text-2xl uppercase tracking-widest">
                  LIKE
                </Text>
              </View>
            </Animated.View>

            {/* Nope Stamp */}
            <Animated.View
              className="absolute top-8 right-8 border-4 border-red-500 rounded-lg px-4 py-2"
              style={[nopeStyle]}
              pointerEvents="none"
            >
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                <Text className="text-red-500 font-black text-2xl uppercase tracking-widest">
                  NOPE
                </Text>
              </View>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
});
