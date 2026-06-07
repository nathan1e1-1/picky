import React from 'react';
import { View } from 'react-native';

export const Stack = ({ children }: { children?: React.ReactNode }) => React.createElement(View, null, children);
export const ThemeProvider = ({ children }:  { value?: any; children?: React.ReactNode }) => React.createElement(View, null, children);
export const DarkTheme = {};
export const DefaultTheme = {};
export const ErrorBoundary = ({ children }: { children?: React.ReactNode }) => React.createElement(View, null, children);
export const Slot = () => React.createElement(View, { testID: 'slot' });
export const Tabs = ({ children }: { children?: React.ReactNode }) => React.createElement(View, null, children);
export const useRouter = () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() });
export const usePathname = () => '/';
export const Link = ({ children }: { children?: React.ReactNode }) => React.createElement(View, null, children);
export const useLocalSearchParams = () => ({});
export const useGlobalSearchParams = () => ({});
export const useSegments = () => [];
export const Redirect = () => null;
