const fs = require("fs");
const path = require("path");

const root = process.cwd();

function patchFile(relativePath, replacements, tag) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) {
    console.warn(`[${tag}] Skipping missing file: ${relativePath}`);
    return;
  }

  let source = fs.readFileSync(filePath, "utf8");
  const hadCrLf = source.includes("\r\n");
  if (hadCrLf) {
    source = source.replace(/\r\n/g, "\n");
  }
  let changed = false;

  for (const { find, replace } of replacements) {
    if (source.includes(replace)) {
      continue;
    }

    if (!source.includes(find)) {
      throw new Error(`[${tag}] Expected snippet not found in ${relativePath}`);
    }

    source = source.replace(find, replace);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, hadCrLf ? source.replace(/\n/g, "\r\n") : source);
    console.log(`[${tag}] Patched ${relativePath}`);
  }
}

function writeFile(relativePath, source, tag) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) {
    console.warn(`[${tag}] Skipping missing file: ${relativePath}`);
    return;
  }

  const current = fs.readFileSync(filePath, "utf8");
  if (current === source) {
    return;
  }

  fs.writeFileSync(filePath, source);
  console.log(`[${tag}] Patched ${relativePath}`);
}

writeFile(
  "node_modules/@ant-design/icons-react-native/react-native.config.js",
  "module.exports = {};\n",
  "native-deps"
);

writeFile(
  "node_modules/rn-fetch-blob/react-native.config.js",
  "module.exports = {};\n",
  "native-deps"
);

patchFile(
  "node_modules/react-native-call-detection/index.js",
  [
    {
      find: `import {
  NativeModules,
  NativeEventEmitter,
  Platform,
  PermissionsAndroid
} from 'react-native'`,
      replace: `import {
  NativeModules,
  NativeEventEmitter,
  Platform,
  PermissionsAndroid,
  registerCallableModule,
} from 'react-native'`,
    },
    {
      find: `const BatchedBridge = require('react-native/Libraries/BatchedBridge/BatchedBridge')

const NativeCallDetector = NativeModules.CallDetectionManager`,
      replace: `const NativeCallDetector = NativeModules.CallDetectionManager`,
    },
    {
      find: `var CallStateUpdateActionModule = require('./CallStateUpdateActionModule')
BatchedBridge.registerCallableModule('CallStateUpdateActionModule', CallStateUpdateActionModule)`,
      replace: `var CallStateUpdateActionModule = require('./CallStateUpdateActionModule')
registerCallableModule('CallStateUpdateActionModule', CallStateUpdateActionModule)`,
    },
  ],
  "native-deps"
);

patchFile(
  "node_modules/react-native-call-detection/android/build.gradle",
  [
    {
      find: `def DEFAULT_COMPILE_SDK_VERSION     = 28
def DEFAULT_BUILD_TOOLS_VERSION     = "28.0.3"
def DEFAULT_TARGET_SDK_VERSION      = 27`,
      replace: `def DEFAULT_COMPILE_SDK_VERSION     = 28
def DEFAULT_TARGET_SDK_VERSION      = 27`,
    },
    {
      find: `android {
    compileSdkVersion safeExtGet('compileSdkVersion', DEFAULT_COMPILE_SDK_VERSION)
    buildToolsVersion safeExtGet('buildToolsVersion', DEFAULT_BUILD_TOOLS_VERSION)

    defaultConfig {
        minSdkVersion 16`,
      replace: `android {
    namespace "com.pritesh.calldetection"
    compileSdkVersion safeExtGet('compileSdkVersion', DEFAULT_COMPILE_SDK_VERSION)

    defaultConfig {
        minSdkVersion safeExtGet('minSdkVersion', 21)`,
    },
    {
      find: `        versionCode 1
        versionName "1.0"
    }
}`,
      replace: `        versionCode 1
        versionName "1.0"
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_11
        targetCompatibility JavaVersion.VERSION_11
    }
}`,
    },
    {
      find: `repositories{
    jcenter()`,
      replace: `repositories{
    google()
    mavenCentral()`,
    },
    {
      find: `dependencies {
    api fileTree(dir: 'libs', include: ['*.jar'])
    api 'com.android.support:appcompat-v7:23.0.1'
    api 'com.facebook.react:react-native:+'
}`,
      replace: `dependencies {
    api fileTree(dir: 'libs', include: ['*.jar'])
    api 'androidx.appcompat:appcompat:1.7.1'
    api 'com.facebook.react:react-android'
}`,
    },
  ],
  "native-deps"
);

patchFile(
  "node_modules/uilib-native/android/src/main/java/com/wix/reactnativeuilib/keyboardinput/utils/RuntimeUtils.java",
  [
    {
      find: `        public void run() {
            // ReactContextHolder.getContext().getNativeModule(UIManagerModule.class).onBatchComplete();
        }`,
      replace: `        public void run() {
            UIManagerModule uiManager = ReactContextHolder.getContext().getNativeModule(UIManagerModule.class);
            if (uiManager != null) {
                uiManager.getUIImplementation().dispatchViewUpdates(-1);
            }
        }`,
    },
  ],
  "native-deps"
);

patchFile(
  "node_modules/react-native-contact-pick/react-native-contact-pick.podspec",
  [
    {
      find: `  s.dependency "React-Core"

  # Don't install the dependencies when we run \`pod install\` in the old architecture.
  if ENV['RCT_NEW_ARCH_ENABLED'] == '1' then
    s.compiler_flags = folly_compiler_flags + " -DRCT_NEW_ARCH_ENABLED=1"
    s.pod_target_xcconfig    = {
        "HEADER_SEARCH_PATHS" => "\\"$(PODS_ROOT)/boost\\"",
        "OTHER_CPLUSPLUSFLAGS" => "-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1",
        "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
    }
    s.dependency "React-Codegen"
    s.dependency "RCT-Folly"
    s.dependency "RCTRequired"
    s.dependency "RCTTypeSafety"
    s.dependency "ReactCommon/turbomodule/core"
  end`,
      replace: `  if defined?(install_modules_dependencies)
    install_modules_dependencies(s)
  else
    s.dependency "React-Core"

    # Don't install the dependencies when we run \`pod install\` in the old architecture.
    if ENV['RCT_NEW_ARCH_ENABLED'] == '1' then
      s.compiler_flags = folly_compiler_flags + " -DRCT_NEW_ARCH_ENABLED=1"
      s.pod_target_xcconfig    = {
          "HEADER_SEARCH_PATHS" => "\\"$(PODS_ROOT)/boost\\"",
          "OTHER_CPLUSPLUSFLAGS" => "-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1",
          "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
      }
      s.dependency "React-Codegen"
      s.dependency "RCT-Folly"
      s.dependency "RCTRequired"
      s.dependency "RCTTypeSafety"
      s.dependency "ReactCommon/turbomodule/core"
    end
  end`,
    },
  ],
  "native-deps"
);

patchFile(
  "node_modules/react-native-exit-app/RNExitApp.podspec",
  [
    {
      find: `\ts.dependency 'React-Core'
  
\t# Don't install the dependencies when we run \`pod install\` in the old architecture.
\tif ENV["RCT_NEW_ARCH_ENABLED"] == "1"
\t  s.compiler_flags = folly_flags + " -DRCT_NEW_ARCH_ENABLED=1"
\t  s.pod_target_xcconfig    = {
\t\t"HEADER_SEARCH_PATHS" => "\\"$(PODS_ROOT)/boost\\"",
\t\t"OTHER_CPLUSPLUSFLAGS" => "-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1",
\t\t"CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
\t  }
  
\t  s.dependency "React-Codegen"
\t  s.dependency "React-RCTFabric"
\t  s.dependency "RCT-Folly"
\t  s.dependency "RCTRequired"
\t  s.dependency "RCTTypeSafety"
\t  s.dependency "ReactCommon/turbomodule/core"
\tend`,
      replace: `\tif defined?(install_modules_dependencies)
\t  install_modules_dependencies(s)
\telse
\t  s.dependency 'React-Core'
  
\t  # Don't install the dependencies when we run \`pod install\` in the old architecture.
\t  if ENV["RCT_NEW_ARCH_ENABLED"] == "1"
\t    s.compiler_flags = folly_flags + " -DRCT_NEW_ARCH_ENABLED=1"
\t    s.pod_target_xcconfig    = {
\t\t  "HEADER_SEARCH_PATHS" => "\\"$(PODS_ROOT)/boost\\"",
\t\t  "OTHER_CPLUSPLUSFLAGS" => "-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1",
\t\t  "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
\t    }
  
\t    s.dependency "React-Codegen"
\t    s.dependency "React-RCTFabric"
\t    s.dependency "RCT-Folly"
\t    s.dependency "RCTRequired"
\t    s.dependency "RCTTypeSafety"
\t    s.dependency "ReactCommon/turbomodule/core"
\t  end
\tend`,
    },
  ],
  "native-deps"
);

patchFile(
  "node_modules/react-native-exit-app/ios/RNExitApp/RNExitApp.h",
  [
    {
      find: `#if RCT_NEW_ARCH_ENABLED
#import <React-Codegen/RNExitAppSpec/RNExitAppSpec.h>
#endif`,
      replace: `#if RCT_NEW_ARCH_ENABLED
#import <RNExitAppSpec/RNExitAppSpec.h>
#endif`,
    },
  ],
  "native-deps"
);
