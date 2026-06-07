import React from 'react';
import { View, Text, SafeAreaView, Pressable, Switch } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const [notifications, setNotifications] = React.useState(true);
  const [location, setLocation] = React.useState(true);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-neutral-900">
      <View className="px-5 pt-2 pb-6">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">Settings</Text>
      </View>

      <View className="px-5">
        {/* Preferences Section */}
        <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Preferences
        </Text>
        <View className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden mb-6">
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-700">
            <Text className="text-base text-gray-900 dark:text-white">Push Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#d1d5db', true: '#f97316' }}
            />
          </View>
          <View className="flex-row items-center justify-between px-4 py-4">
            <Text className="text-base text-gray-900 dark:text-white">Location Services</Text>
            <Switch
              value={location}
              onValueChange={setLocation}
              trackColor={{ false: '#d1d5db', true: '#f97316' }}
            />
          </View>
        </View>

        {/* Account Section */}
        <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Account
        </Text>
        <View className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden mb-6">
          <Pressable className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
            <Text className="text-base text-gray-900 dark:text-white">Edit Taste Profile</Text>
          </Pressable>
          <Pressable className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
            <Text className="text-base text-gray-900 dark:text-white">Reset Swipe History</Text>
          </Pressable>
          <Pressable className="px-4 py-4">
            <Text className="text-base text-red-500">Log Out</Text>
          </Pressable>
        </View>

        {/* About */}
        <Text className="text-center text-gray-400 dark:text-gray-500 text-sm mt-4">
          Picky v1.0.0
        </Text>
      </View>
    </SafeAreaView>
  );
}
