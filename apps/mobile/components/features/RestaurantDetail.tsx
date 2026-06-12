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
import { Button } from '@/components/ui/Button';
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
    <View className="flex-1 bg-gray-50 dark:bg-neutral-900">
      {/* Header Image */}
      <View className="relative h-[40%]">
        {restaurant.photos[0] ? (
          <Image source={{ uri: restaurant.photos[0] }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="w-full h-full bg-gray-200 dark:bg-neutral-800 items-center justify-center">
            <Text className="text-gray-400 dark:text-gray-500">No photo available</Text>
          </View>
        )}
        <Pressable
          testID="back-button"
          className="absolute top-12 left-4 w-11 h-11 rounded-full bg-black/40 items-center justify-center"
          onPress={onBack}
        >
          <ArrowLeft size={22} color="white" />
        </Pressable>
      </View>

      {/* Content */}
      <View className="flex-1 -mt-6 bg-gray-50 dark:bg-neutral-900 rounded-t-3xl">
        {/* Tab Bar */}
        <View className="flex-row px-4 pt-5 pb-3">
          {TAB_CONFIG.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                testID={`tab-${tab.key}`}
                onPress={() => setActiveTab(tab.key)}
                className={`flex-1 items-center py-3 rounded-xl ${isActive ? 'bg-orange-50 dark:bg-orange-900/20' : ''}`}
              >
                <Icon size={20} color={isActive ? '#f97316' : isDark ? '#9ca3af' : '#6b7280'} />
                <Text
                  className={`text-sm mt-1.5 font-medium ${
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
        <ScrollView className="flex-1 px-4 pt-2">
          {activeTab === 'info' && (
            <InfoTab
              restaurant={restaurant}
              onOpenPhone={openPhone}
              onOpenWebsite={openWebsite}
            />
          )}
          {activeTab === 'menu' && <MenuTab restaurant={restaurant} />}
          {activeTab === 'location' && (
            <LocationTab restaurant={restaurant} onOpenMaps={openMaps} />
          )}
          {activeTab === 'hours' && <HoursTab restaurant={restaurant} currentDay={currentDay} />}
          <View className="h-12" />
        </ScrollView>
      </View>
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
    <View className="space-y-8">
      {/* Header Section */}
      <View>
        <Text className="text-3xl font-bold text-gray-900 dark:text-white leading-tight" numberOfLines={2}>
          {restaurant.name}
        </Text>
        
        <View className="flex-row items-center mt-3 space-x-4">
          <View className="flex-row items-center">
            <Star size={16} color="#fbbf24" fill="#fbbf24" />
            <Text className="text-base text-gray-500 dark:text-gray-400 ml-1.5">
              {restaurant.pickyScoreBreakdown.googleRating} rating
            </Text>
          </View>
          <PickyScoreBadge score={restaurant.pickyScore} size="sm" />
        </View>
      </View>

      {/* Cuisine Tags */}
      <View className="flex-row flex-wrap">
        {restaurant.cuisineTypes.map((cuisine) => (
          <View
            key={cuisine}
            className="bg-orange-100 dark:bg-orange-900/30 rounded-full px-4 py-2 mr-2 mb-2"
          >
            <Text className="text-sm text-orange-700 dark:text-orange-300 font-medium">{cuisine}</Text>
          </View>
        ))}
        <View className="bg-gray-100 dark:bg-neutral-800 rounded-full px-4 py-2 mr-2 mb-2">
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {'$'.repeat(restaurant.priceRange)}
          </Text>
        </View>
      </View>

      {/* Info Card */}
      <View className="bg-white dark:bg-neutral-800 rounded-2xl p-6 space-y-5">
        {restaurant.distance && (
          <View className="flex-row items-center">
            <Navigation size={22} color="#9ca3af" />
            <Text className="text-gray-700 dark:text-gray-300 ml-4 text-lg">{restaurant.distance} away</Text>
          </View>
        )}

        <View className="flex-row items-center">
          <MapPin size={22} color="#9ca3af" />
          <Text className="text-gray-700 dark:text-gray-300 ml-4 text-lg flex-1 leading-7">{restaurant.address}</Text>
        </View>

        {restaurant.phone && (
          <Pressable className="flex-row items-center" onPress={onOpenPhone}>
            <Phone size={22} color="#9ca3af" />
            <Text className="text-orange-500 dark:text-orange-400 ml-4 text-lg">{restaurant.phone}</Text>
          </Pressable>
        )}

        {restaurant.website && (
          <Pressable className="flex-row items-center" onPress={onOpenWebsite}>
            <Globe size={22} color="#9ca3af" />
            <Text className="text-orange-500 dark:text-orange-400 ml-4 text-lg flex-1" numberOfLines={1}>
              {restaurant.website}
            </Text>
          </Pressable>
        )}

        <View className="flex-row items-center">
          <Clock size={22} color={restaurant.isOpenNow ? '#22c55e' : '#ef4444'} />
          <Text
            className={`ml-4 text-lg font-semibold ${
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
      <View className="items-center py-16">
        <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center mb-6">
          <Utensils size={32} color="#9ca3af" />
        </View>
        <Text className="text-gray-900 dark:text-white text-xl font-semibold text-center mb-3">
          Menu not available
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-base text-center px-8 leading-6">
          We're working on adding menu details
        </Text>
      </View>
    );
  }

  return (
    <View className="space-y-8">
      {restaurant.menu.map((category, idx) => (
        <View key={idx}>
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-5">
            {category.category}
          </Text>
          <View className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden">
            {category.items.map((item, itemIdx) => (
              <View
                key={itemIdx}
                className={`flex-row justify-between items-start p-5 ${
                  itemIdx !== category.items.length - 1 ? 'border-b border-gray-100 dark:border-neutral-700' : ''
                }`}
              >
                <View className="flex-1 mr-4">
                  <Text className="text-gray-900 dark:text-white font-semibold text-lg">{item.name}</Text>
                  {item.description && (
                    <Text className="text-gray-500 dark:text-gray-400 text-base mt-2 leading-6">
                      {item.description}
                    </Text>
                  )}
                  {item.dietaryTags.length > 0 && (
                    <View className="flex-row flex-wrap mt-3">
                      {item.dietaryTags.map((tag) => (
                        <View key={tag} className="bg-green-100 dark:bg-green-900/30 rounded-full px-3 py-1 mr-2">
                          <Text className="text-sm text-green-700 dark:text-green-300">{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                {item.price && (
                  <Text className="text-gray-900 dark:text-white font-bold text-lg">
                    ${item.price.toFixed(2)}
                  </Text>
                )}
              </View>
            ))}
          </View>
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
    <View className="space-y-8">
      <View className="bg-white dark:bg-neutral-800 rounded-2xl p-6 space-y-5">
        <View className="flex-row items-center">
          <MapPin size={22} color="#9ca3af" />
          <Text className="text-gray-700 dark:text-gray-300 ml-4 text-lg flex-1 leading-7">{restaurant.address}</Text>
        </View>
        {restaurant.distance && (
          <View className="flex-row items-center">
            <Navigation size={22} color="#9ca3af" />
            <Text className="text-gray-700 dark:text-gray-300 ml-4 text-lg">{restaurant.distance} away</Text>
          </View>
        )}
      </View>

      <Button variant="primary" onPress={onOpenMaps}>
        Open in Maps
      </Button>
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
      <View className="items-center py-16">
        <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center mb-6">
          <Clock size={32} color="#9ca3af" />
        </View>
        <Text className="text-gray-900 dark:text-white text-xl font-semibold text-center mb-3">
          Hours not available
        </Text>
      </View>
    );
  }

  return (
    <View className="space-y-8">
      {/* Status Badge */}
      <View className={`flex-row items-center self-start px-5 py-3 rounded-full ${
        restaurant.isOpenNow ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
      }`}>
        <Clock size={20} color={restaurant.isOpenNow ? '#22c55e' : '#ef4444'} />
        <Text
          className={`ml-3 font-bold text-lg ${
            restaurant.isOpenNow ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
          }`}
        >
          {restaurant.isOpenNow ? 'Open Now' : 'Closed'}
        </Text>
      </View>

      {/* Gap between status and schedule */}
      <View className="h-2" />

      {/* Weekly Schedule */}
      <View className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden">
        {hoursEntries.map(([day, hours], index) => {
          const isToday = day.toLowerCase() === currentDay;
          return (
            <View
              key={day}
              className={`flex-row justify-between items-center py-4 px-5 ${
                isToday ? 'bg-orange-50 dark:bg-orange-900/20' : ''
              } ${index !== hoursEntries.length - 1 ? 'border-b border-gray-100 dark:border-neutral-700' : ''}`}
            >
              <View className="flex-row items-center">
                <Text
                  className={`capitalize font-semibold text-lg ${
                    isToday ? 'text-orange-700 dark:text-orange-300' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {day}
                </Text>
                {isToday && (
                  <View className="bg-orange-500 rounded-full px-3 py-1 ml-3">
                    <Text className="text-white text-sm font-bold">Today</Text>
                  </View>
                )}
              </View>
              <View className="items-end">
                {hours.split(', ').map((timeRange, idx) => (
                  <Text
                    key={idx}
                    className={`text-lg ${
                      isToday ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {timeRange}
                  </Text>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
