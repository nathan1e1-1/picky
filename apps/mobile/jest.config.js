const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((react-native.*|expo.*|@expo.*|@react-navigation.*|@unimodules.*|unimodules.*|nativewind|react-native-css-interop|@react-native.*)/))',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@picky/types$': '<rootDir>/../../packages/types',
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
};
