jest.mock('react-native-gesture-handler');
jest.mock('react-native-reanimated');
jest.mock('react-native-worklets');
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return new Proxy({}, {
    get: (_, name) => {
      if (name === '__esModule') return true;
      const nameStr = String(name);
      return (props: any) => React.createElement(Text, { ...props, testID: `icon-${nameStr}` }, nameStr);
    },
  });
});
jest.mock('expo-symbols');
jest.mock('expo-router');
jest.mock('expo-location');
jest.mock('@/hooks/useLocation', () => ({
  useLocation: jest.fn().mockReturnValue({
    lat: 37.7749,
    lng: -122.4194,
    loading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));
