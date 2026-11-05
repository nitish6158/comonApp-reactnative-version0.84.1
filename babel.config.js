module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@Assets': './assets',
            '@Images': './assets/images',
            '@Fonts': './assets/fonts',
            '@Animations': './assets/lottie',
            '@Atoms': './src/Atoms',
            '@Constants': './src/Constants',
            '@Components': './src/Components',
            '@Containers': './src/Containers',
            '@Context': './src/Context',
            '@Service': './src/graphql',
            '@Hooks': './src/hooks',
            '@Models': './src/models',
            '@Navigation': './src/navigation',
            '@Notification': './src/notification',
            '@Store': './src/redux',
            '@Util': './src/utils',
            '@Types': './types',
            '@LocalDB': './src/local_DB',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
