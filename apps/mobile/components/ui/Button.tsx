import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isDisabled?: boolean;
  children: string;
  className?: string;
}

export function Button({
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  children,
  className = '',
}: ButtonProps) {
  const baseClasses = 'items-center justify-center rounded-full font-semibold';

  const variantClasses = {
    primary: 'bg-orange-500 active:bg-orange-600',
    secondary: 'border border-orange-500 bg-transparent active:bg-orange-50 dark:active:bg-orange-900/20',
    danger: 'bg-red-500 active:bg-red-600',
  };

  const textClasses = {
    primary: 'text-white',
    secondary: 'text-orange-500',
    danger: 'text-white',
  };

  const sizeClasses = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const disabledClasses = isDisabled ? 'opacity-50' : '';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={variant === 'secondary' ? '#f97316' : '#ffffff'} />
      ) : (
        <Text className={`${textClasses[variant]} ${textSizeClasses[size]} font-semibold`}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}

export default Button;
