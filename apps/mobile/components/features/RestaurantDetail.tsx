import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  Linking,
  useColorScheme,
} from 'react-native';
import {
  MapPin,
  Phone,
  Globe,
  Clock,
  Star,
  ArrowLeft,
  Navigation,
  Utensils,
  Calendar,
} from 'lucide-react-native';
import { PickyScoreBadge } from '@/components/ui/PickyScoreBadge';
import { PickyRestaurant } from '@picky/types';

type Tab = 'info' | 'menu' | 'location' | 'hours';

interface RestaurantDetailProps {
  restaurant: PickyRestaurant;
  onBack: () => void;
}

const TAB_CONFIG: { key: Tab; label: string; icon: any }[] = [
  { key: 'info', label: 'Info', icon: Star },
  { key: 'menu', label: 'Menu', icon: Utensils },
  { key: 'location', label: 'Location', icon: MapPin },
  { key: 'hours', label: 'Hours', icon: Calendar },
];

export function RestaurantDetail({ restaurant, onBack }: RestaurantDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const openMaps = useCallback(() => {
    const query = encodeURIComponent(restaurant.name);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url);
  }, [restaurant.name]);

  const openPhone = useCallback(() => {
    if (restaurant.phone) {
      Linking.openURL(`tel:${restaurant.phone}`);
    }
  }, [restaurant.phone]);

  const openWebsite = useCallback(() => {
    if (restaurant.website) {
      Linking.openURL(restaurant.website);
    }
  }, [restaurant.website]);

  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900">
      {/* Header Image */}
      <View className="relative h-[30%]">
        {restaurant.photos[0] ? (
          <Image source={{ uri: restaurant.photos[0] }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="w-full h-full bg-gray-200 dark:bg-neutral-800 items-center justify-center">
            <Text className="text-gray-400 dark:text-gray-500">No photo available</Text>
          </View>
        )}
        <Pressable
          testID="back-button"
          className="absolute top-12 left-4 w-10 h-10 rounded-full bg-black/50 items-center justify-center"
          onPress={onBack}
        >
          <ArrowLeft size={20} color="white" />
        </Pressable>
      </View>

      {/* Tab Bar */}
      <View className="flex-row border-b border-gray-200 dark:border-neutral-800">
        {TAB_CONFIG.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              testID={`tab-${tab.key}`}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-1 items-center py-3 ${isActive ? 'border-b-2 border-orange-500' : ''}`}
            >
              <Icon size={16} color={isActive ? '#f97316' : isDark ? '#9ca3af' : '#6b7280'} />
              <Text
                className={`text-xs mt-1 font-medium ${
                  isActive ? 'text-orange-500' : isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Tab Content */}
      <ScrollView className="flex-1 px-5 pt-4">
        {activeTab === 'info' && (
          <InfoTab
            restaurant={restaurant}
            onOpenPhone={openPhone}
            onOpenWebsite={openWebsite}
          />
        )}
        {activeTab === 'menu' && <MenuTab restaurant={restaurant} />}
        {activeTab === 'location' && <LocationTab restaurant={restaurant} onOpenMaps={openMaps} />}
        {activeTab === 'hours' && <HoursTab restaurant={restaurant} currentDay={currentDay} />}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}

function InfoTab({
  restaurant,
  onOpenPhone,
  onOpenWebsite,
}: {
  restaurant: PickyRestaurant;
  onOpenPhone: () => void;
  onOpenWebsite: () => void;
}) {
  return (
    <View>
      {/* Name & Score */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white flex-1 mr-2" numberOfLines={2}>
          {restaurant.name}
        </Text>
        <PickyScoreBadge score={restaurant.pickyScore} size="lg" />
      </View>

      {/* Rating & Reviews */}
      <View className="flex-row items-center mb-3">
        <Star size={16} color="#fbbf24" fill="#fbbf24" />
        <Text className="text-sm text-gray-600 dark:text-gray-300 ml-1">
          {restaurant.pickyScoreBreakdown.googleRating} rating
        </Text>
      </View>

      {/* Cuisine & Price */}
      <View className="flex-row flex-wrap mb-4">
        {restaurant.cuisineTypes.map((cuisine) => (
          <View
            key={cuisine}
            className="bg-orange-100 dark:bg-orange-900/30 rounded-full px-3 py-1 mr-2 mb-2"
          >
            <Text className="text-xs text-orange-700 dark:text-orange-300 font-medium">{cuisine}</Text>
          </View>
        ))}
        <View className="bg-gray-100 dark:bg-neutral-800 rounded-full px-3 py-1 mr-2 mb-2">
          <Text className="text-xs text-gray-600 dark:text-gray-400">
            {'$'.repeat(restaurant.priceRange)}
          </Text>
        </View>
      </View>

      {/* Quick Info */}
      <View className="space-y-3 mb-6">
        {restaurant.distance && (
          <View className="flex-row items-center">
            <Navigation size={18} color="#6b7280" />
            <Text className="text-gray-700 dark:text-gray-300 ml-3">{restaurant.distance} away</Text>
          </View>
        )}

        <View className="flex-row items-center">
          <MapPin size={18} color="#6b7280" />
          <Text className="text-gray-700 dark:text-gray-300 ml-3 flex-1">{restaurant.address}</Text>
        </View>

        {restaurant.phone && (
          <Pressable className="flex-row items-center" onPress={onOpenPhone}>
            <Phone size={18} color="#6b7280" />
            <Text className="text-blue-600 dark:text-blue-400 ml-3">{restaurant.phone}</Text>
          </Pressable>
        )}

        {restaurant.website && (
          <Pressable className="flex-row items-center" onPress={onOpenWebsite}>
            <Globe size={18} color="#6b7280" />
            <Text className="text-blue-600 dark:text-blue-400 ml-3" numberOfLines={1}>
              {restaurant.website}
            </Text>
          </Pressable>
        )}

        <View className="flex-row items-center">
          <Clock size={18} color={restaurant.isOpenNow ? '#22c55e' : '#ef4444'} />
          <Text
            className={`ml-3 font-medium ${
              restaurant.isOpenNow ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {restaurant.isOpenNow ? 'Open Now' : 'Closed'}
          </Text>
        </View>
      </View>

    </View>
  );
}

function MenuTab({ restaurant }: { restaurant: PickyRestaurant }) {
  const hasMenu = restaurant.menu && restaurant.menu.length > 0;

  if (!hasMenu) {
    return (
      <View className="items-center py-12">
        <Utensils size={48} color="#d1d5db" />
        <Text className="text-gray-400 dark:text-gray-500 text-lg mt-4 text-center">
          Menu information not available
        </Text>
        <Text className="text-gray-400 dark:text-gray-500 text-sm mt-2 text-center px-8">
          We're working on adding menu details. Check back soon!
        </Text>
      </View>
    );
  }

  return (
    <View>
      {restaurant.menu.map((category, idx) => (
        <View key={idx} className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {category.category}
          </Text>
          {category.items.map((item, itemIdx) => (
            <View
              key={itemIdx}
              className="flex-row justify-between items-start py-3 border-b border-gray-100 dark:border-neutral-800"
            >
              <View className="flex-1 mr-4">
                <Text className="text-gray-900 dark:text-white font-medium">{item.name}</Text>
                {item.description && (
                  <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    {item.description}
                  </Text>
                )}
                {item.dietaryTags.length > 0 && (
                  <View className="flex-row flex-wrap mt-1">
                    {item.dietaryTags.map((tag) => (
                      <Text key={tag} className="text-xs text-green-600 dark:text-green-400 mr-2">
                        {tag}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
              {item.price && (
                <Text className="text-gray-900 dark:text-white font-semibold">
                  ${item.price.toFixed(2)}
                </Text>
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function LocationTab({
  restaurant,
  onOpenMaps,
}: {
  restaurant: PickyRestaurant;
  onOpenMaps: () => void;
}) {
  return (
    <View>
      <View className="bg-gray-50 dark:bg-neutral-800 rounded-2xl p-4 mb-4">
        <View className="flex-row items-center mb-3">
          <MapPin size={18} color="#6b7280" />
          <Text className="text-gray-700 dark:text-gray-300 ml-3 flex-1">{restaurant.address}</Text>
        </View>
        {restaurant.distance && (
          <View className="flex-row items-center">
            <Navigation size={18} color="#6b7280" />
            <Text className="text-gray-700 dark:text-gray-300 ml-3">{restaurant.distance} away</Text>
          </View>
        )}
      </View>

      <Pressable
        onPress={onOpenMaps}
        className="bg-orange-500 py-3 rounded-full items-center"
      >
        <Text className="text-white font-semibold">Open in Maps</Text>
      </Pressable>
    </View>
  );
}

function HoursTab({
  restaurant,
  currentDay,
}: {
  restaurant: PickyRestaurant;
  currentDay: string;
}) {
  const hoursEntries = Object.entries(restaurant.hours);
  const hasHours = hoursEntries.length > 0;

  if (!hasHours) {
    return (
      <View className="items-center py-12">
        <Clock size={48} color="#d1d5db" />
        <Text className="text-gray-400 dark:text-gray-500 text-lg mt-4 text-center">
          Hours not available
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View className="flex-row items-center mb-4">
        <Clock size={18} color={restaurant.isOpenNow ? '#22c55e' : '#ef4444'} />
        <Text
          className={`ml-3 font-medium text-lg ${
            restaurant.isOpenNow ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {restaurant.isOpenNow ? 'Open Now' : 'Closed'}
        </Text>
      </View>

      <View className="bg-gray-50 dark:bg-neutral-800 rounded-2xl overflow-hidden">
        {hoursEntries.map(([day, hours]) => {
          const isToday = day.toLowerCase() === currentDay;
          return (
            <View
              key={day}
              className={`flex-row justify-between items-center py-3 px-4 ${
                isToday ? 'bg-orange-50 dark:bg-orange-900/20' : ''
              } ${day !== hoursEntries[hoursEntries.length - 1][0] ? 'border-b border-gray-200 dark:border-neutral-700' : ''}`}
            >
              <View className="flex-row items-center">
                <Text
                  className={`capitalize font-medium ${
                    isToday ? 'text-orange-700 dark:text-orange-300' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {day}
                </Text>
                {isToday && (
                  <View className="bg-orange-500 rounded-full px-2 py-0.5 ml-2">
                    <Text className="text-white text-xs font-medium">Today</Text>
                  </View>
                )}
              </View>
              <Text
                className={`${
                  isToday ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {hours}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
