import 'nativewind';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface ImageProps {
    className?: string;
  }
  interface PressableProps {
    className?: string;
  }
  interface TextInputProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
  }
  interface FlatListProps {
    className?: string;
  }
  interface SafeAreaViewProps {
    className?: string;
  }
  interface SwitchProps {
    className?: string;
  }
}

declare module 'react-native-reanimated' {
  interface AnimatedProps {
    className?: string;
  }
}

declare module '*.css' {
  const content: string;
  export default content;
}
