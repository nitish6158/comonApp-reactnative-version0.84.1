/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 300000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath:
        'ios/build/Build/Products/Debug-iphonesimulator/commonapp.app',
      build:
        'xcodebuild -workspace ios/commonapp.xcworkspace -scheme commonapp -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath:
        'ios/build/Build/Products/Release-iphonesimulator/commonapp.app',
      build:
        'xcodebuild -workspace ios/commonapp.xcworkspace -scheme commonapp -configuration Release -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath:
        'android/app/build/outputs/apk/development/debug/app-development-debug.apk',
      testBinaryPath:
        'android/app/build/outputs/apk/androidTest/development/debug/app-development-debug-androidTest.apk',
      build:
        'cd android && ./gradlew assembleDevelopmentDebug assembleDevelopmentDebugAndroidTest -DtestBuildType=debug -PreactNativeDevServerPort=8081',
      reversePorts: [8081],
    },
    'android.release': {
      type: 'android.apk',
      binaryPath:
        'android/app/build/outputs/apk/development/release/app-development-release.apk',
      testBinaryPath:
        'android/app/build/outputs/apk/androidTest/development/release/app-development-release-androidTest.apk',
      build:
        'cd android && ./gradlew assembleDevelopmentRelease assembleDevelopmentReleaseAndroidTest -DtestBuildType=release',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 16',
      },
    },
    emulator: {
      type: 'android.emulator',
      device: {
        // Local AVDs seen on this machine: Medium_Phone_API_36.0, Pixel_9_Pro
        avdName: 'Pixel_9_Pro',
      },
    },
    attached: {
      type: 'android.attached',
      device: {
        adbName: '.*',
      },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release',
    },
    'android.att.debug': {
      device: 'attached',
      app: 'android.debug',
    },
  },
};
