import React from 'react';
import { View } from 'react-native';

export const Gesture = {
  Pan: () => ({
    enabled: jest.fn().mockReturnThis(),
    onBegin: jest.fn().mockReturnThis(),
    onUpdate: jest.fn().mockReturnThis(),
    onEnd: jest.fn().mockReturnThis(),
  }),
};

export const GestureDetector = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(View, null, children);
};

export const GestureHandlerRootView = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(View, { style: { flex: 1 } }, children);
};
