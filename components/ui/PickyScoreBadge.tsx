import React from 'react';
import { View, Text } from 'react-native';

interface PickyScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function PickyScoreBadge({ score, size = 'md' }: PickyScoreBadgeProps) {
  const getColor = () => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-orange-500';
  };

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <View className={`${getColor()} ${sizeClasses[size]} rounded-full flex-row items-center`}>
      <Text className="text-white font-bold">{score}</Text>
    </View>
  );
}
