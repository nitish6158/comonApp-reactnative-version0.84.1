module.exports = {
  project: {
    android: {
      sourceDir: './android',
      appName: 'app',
      packageName: 'io.comon.app',
    },
    ios: {
      sourceDir: './ios',
    },
  },
  assets: ['./assets/fonts/', './assets/sounds/'],
  dependencies: {
    'react-native-video': {
      platforms: {
        android: {
          sourceDir: './node_modules/react-native-video/android-exoplayer',
        },
      },
    },
    'react-native-ui-lib': {
      platforms: {
        android: null,
      },
    },
    'uilib-native': {
      platforms: {
        android: null,
      },
    },
  },
};
