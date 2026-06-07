import React from 'react';
import { View } from 'react-native';

export const useSharedValue = (initial: any) => ({ value: initial });

export const useAnimatedStyle = (fn: () => any) => fn();

export const withSpring = (value: any) => value;
export const withTiming = (value: any, _config?: any, callback?: any) => {
  if (callback) callback();
  return value;
};

export const interpolate = (value: number, _input: number[], output: number[]) => {
  if (value <= _input[0]) return output[0];
  if (value >= _input[_input.length - 1]) return output[output.length - 1];
  return output[Math.floor(output.length / 2)];
};

export const runOnJS = (fn: any) => fn;

export const Extrapolation = {
  CLAMP: 'clamp',
};

const AnimatedView = React.forwardRef((props: any, ref: any) =>
  React.createElement(View, { ...props, ref })
);
AnimatedView.displayName = 'Animated.View';

export default {
  View: AnimatedView,
};
