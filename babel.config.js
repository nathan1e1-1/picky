module.exports = function (api) {
  api.cache.using(() => process.env.NODE_ENV);

  const seen = new Set(['react-native-reanimated/plugin', 'react-native-worklets/plugin']);
  const plugins = ['react-native-reanimated/plugin'];

  if (!api.env('test')) {
    const nativewindPlugin = require('nativewind/babel');
    const result = nativewindPlugin({ cacheKey: 'nativewind' });
    if (result && Array.isArray(result.plugins)) {
      for (const p of result.plugins) {
        const name = Array.isArray(p) ? p[0] : p;
        if (name !== null && !seen.has(name)) {
          seen.add(name);
          plugins.push(p);
        }
      }
    }
  }

  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
