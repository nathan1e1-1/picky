import React from 'react';
import { View } from 'react-native';

const createGestureMock = () => ({
  enabled: jest.fn().mockReturnThis(),
  onBegin: jest.fn().mockReturnThis(),
  onUpdate: jest.fn().mockReturnThis(),
  onEnd: jest.fn().mockReturnThis(),
  minDistance: jest.fn().mockReturnThis(),
});

export const Gesture = {
  Pan: createGestureMock,
  Tap: createGestureMock,
  Race: jest.fn().mockImplementation((...args) => args[0]),
};

export const GestureDetector = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(View, null, children);
};

export const GestureHandlerRootView = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(View, { style: { flex: 1 } }, children);
};
