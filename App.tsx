/**
 * App.tsx
 *
 * This file contains the main entry point of the application.
 * It initializes various providers and configures the navigation stack.
 */
import "react-native-get-random-values";
import React, { useEffect } from "react";
import { Alert, Text, LogBox, Platform, StatusBar, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "./localization/i18n.config";
import Jotai from "jotai";
import { Provider, useDispatch } from "react-redux";
import { LanguageProvider } from "@/Context/LanguageProvider";
import { PhoneProvider } from "@/Context/PhoneProvider";
import { PersistGate } from "redux-persist/integration/react";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import store, { persistor } from "@/redux/Store";
import Application from "@/navigation/Application";
import { NavigationContainer } from "@react-navigation/native";
import { navigationRef } from "@/navigation/utility";
import { RootSiblingParent } from "react-native-root-siblings";
import RNVoipCall from "react-native-voips-calls";
import linking from "@/navigation/LinkingConfiguration";
import { currentUserIdAtom } from "@Atoms/RealmloginManager";
import AsyncStorage from "@react-native-async-storage/async-storage";

import createAgoraRtcEngine, { LogLevel } from "react-native-agora";
import { AGORA_APP_ID } from "@Service/provider/endpoints";

import { ApolloProvider } from "@apollo/client";
import { client } from "@Service/provider/authLink";
import { user } from "@/schemas/schema";

/**
 * Main entry point of the application.
 */

function App() {
  LogBox.ignoreAllLogs();

  useEffect(() => {
    initializeGlobalAgora();
    setTimeout(() => {
      initializeCall();
    }, 2000);
  }, []);

  /**
   * Initializes the VoIP call configuration.
   */
  function initializeCall() {
    //InitialCall only needed in IOS
    //Link:- https://github.com/ajith-ab/react-native-voip-call
    if (Platform.OS == "ios") {
      const options = {
        appName: "Comon",
        imageName: "",
        includesCallsInRecents: false,
        supportsVideo: true,
      };
      RNVoipCall.initializeCall(options)
        .then(() => {})
        .catch();
    }
  }

  /**
   * Initializes the global Agora engine for fast and global access.
   */
  function initializeGlobalAgora() {
    const AgoraEngine = createAgoraRtcEngine();
    global.engine = AgoraEngine;
    AgoraEngine.initialize({
      appId: AGORA_APP_ID,
      logConfig: {
        fileSizeInKB: 1024,
        level: LogLevel.LogLevelInfo,
      },
    });
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <Jotai.Provider>
                <DataLoaderContainer />
              </Jotai.Provider>
            </PersistGate>
          </Provider>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  );
}

/**
 * Component for loading data and resources.
 */
function DataLoaderContainer() {
  useEffect(() => {
    currentUserIdAtom.onMount = (setValue) => {
      (async () => {
        const item = await AsyncStorage.getItem("MyProfile");
        if (item) {
          const data = JSON.parse(item) as user;
          setValue(data);
        } else {
        }
      })();
    };
  }, []);

  return (
    <ApolloProvider client={client}>
      <PhoneProvider>
        <RootSiblingParent>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer linking={linking} ref={navigationRef}>
              <Application />
            </NavigationContainer>
          </GestureHandlerRootView>
        </RootSiblingParent>
      </PhoneProvider>
    </ApolloProvider>
  );
}

export default App;
