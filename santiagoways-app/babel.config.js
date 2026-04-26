module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Reanimated 4 (SDK 54+) renamed its babel plugin and split the worklets
    // runtime into its own package. This must be the LAST plugin in the list.
    plugins: ['react-native-worklets/plugin'],
  };
};
