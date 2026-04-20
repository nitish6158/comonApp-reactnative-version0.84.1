// import { Realm, useUser } from "@realm/react";
import { AppState, AppStateStatus, Dimensions, Image, Linking, Platform, Text, View } from "react-native";

import { RNVoipPushKit } from "react-native-voips-calls";
import React, { useEffect, useRef, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import AudioRecorderPlayer from "react-native-nitro-sound";
import { AuthNavigator } from "@Navigation/AuthNavigator";
import NetInfo from "@react-native-community/netinfo";

import {
  ComonSyncStatus,
  GlobalContainer,
  HomeContainer,
} from "@/Containers/HomeContainer";
import Lottie from "lottie-react-native";

import {
  ANDROID_URL,
  IOS_URL,
  PUBLIC_API,

} from "@Service/provider/endpoints";
// import RealmContext from "@/schemas";
import SplashContainer from "@/Containers/SplashContainer";
import { asyncStorageKeys } from "@/Constants/asyncStorageKeys";

import { createStackNavigator } from "@react-navigation/stack";

import messaging from "@react-native-firebase/messaging";

import InitialCallingContainer from "../Containers/InitialCallingContainer";
import { atom, useSetAtom } from "jotai";
import {
  CallNotification,
  CallNotificationSchemaType,
  SocketCallEndType,
} from "@/notification/Interfaces/Call";
import { MainNavigatorParamList, SeniorNavigatorParamList } from "./screenPropsTypes";
import { LanguageProvider } from "@/Context";
import ToastMessage from "@/utils/ToastMesage";
import { useTranslation } from "react-i18next";
import RBSheet, { RBSheetProps } from "react-native-raw-bottom-sheet";
import OtaModal from "react-native-ota-modal";
import RNExitApp, { exitApp } from "react-native-exit-app";
import { versionmanagement } from "@/schemas/schema";
import VersionCheck from "react-native-version-check";
import { MainNavigator } from "./MainNavigation";
import { SeniorNavigator } from "./SeniorNavigator";
// import { ClientResetMode } from "realm";
import { realmErrors } from "@/schemas/errorCodes";
import { windowHeight } from "@/utils/ResponsiveView";
import RealmErrorScreen from "@/Containers/RealmErrorScreen";
import { getSession, removeSession } from "@/utils/session";
import { storage } from "@/redux/backup/mmkv";
import { keys } from "@/redux/backup/keys";
import { useDispatch } from "react-redux";
import { resetOrganisationState } from "@/redux/Reducer/OrganisationsReducer";
import { resetContactState } from "@/redux/Reducer/ContactReducer";
import { resetCallState } from "@/redux/Reducer/CallReducer";
import { resetChatState, setMyProfile } from "@/redux/Reducer/ChatReducer";
import { useLogoutLazyQuery, useRefreshSessionLazyQuery } from "@/graphql/generated/auth.generated";
import { useAppSelector } from "@/redux/Store";
import { useGetLanguageListQuery } from "@/graphql/generated/user.generated";
import { setLanguageList } from "@/redux/Reducer/LanguageReducer";
import { socketConnect } from "@/utils/socket/SocketConnection";
import { ChatProvider } from "@/Context/ChatProvider";
import { AuthContext, AuthProvider } from "@/Components/AuthContext";
import { ensureRemoteMessagesRegistered } from "@/utils/firebaseMessaging";
import { PlateformType } from "@/graphql/generated/types";

// const { useQuery, useRealm } = RealmContext;

const { width } = Dimensions.get("window");
global.audioPlayer = AudioRecorderPlayer;
global.roomId = null;

const openRealmBehaviorConfig = {
  type: "openImmediately",
};

import {
  callSchema,
  deviceSchema,
  memberSchema,
  assignmentSchema,
  scenarioSchema,
  reminderSchema,
  versionmanagementSchema,
  organizationSchema,
  userSchema,
} from "@/schemas/schema";

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: {
    id: string;
  };
  Senior: {};
};

type initialRouteAtomType = {
  name: keyof (MainNavigatorParamList & SeniorNavigatorParamList) | undefined;
  payload: {};
};

export const callQueueAtom = atom<CallNotification | null>(null);
export const initialRouteAtom = atom<initialRouteAtomType>({
  name: undefined,
  payload: {},
});
export const missedCallAtom = atom<
  null | SocketCallEndType | CallNotificationSchemaType
>(null);
export const appStateAtom = atom("inactive");
export const deviceUniqueID = atom<string | null>(null);

const RootStack = createStackNavigator();
// const { RealmProvider } = RealmContext;

/**
 * The Application component serves as the entry point of the app.
 * It sets up the navigation, initializes Realm, handles push notifications, and manages the initial calling container.
 */
export default function Application() {
  const [error, setError] = useState<string>("");

  useEffect(() => {
    IOSDeviceToken();
    AskForNotificationPermission();
  }, []);

  // On every app open, this function will get the iOS device token and update AsyncStorage with the device token, so that it can be used throughout the app.
  function IOSDeviceToken() {
    RNVoipPushKit.getPushKitDeviceToken(async (res) => {
      if (res.platform === "ios") {
        const deviceToken = await AsyncStorage.getItem(
          asyncStorageKeys.deviceToken
        );
        if (deviceToken) {
          if (deviceToken !== res.deviceToken) {
            await AsyncStorage.setItem(
              asyncStorageKeys.deviceToken,
              res.deviceToken
            );
          }
        } else {
          await AsyncStorage.setItem(
            asyncStorageKeys.deviceToken,
            res.deviceToken
          );
        }
      }
    });
  }

  // Firebase only gives FCM-token and APN-token if App notification permission is granted by the user.
  // This function asks the user to grant notification permission so that push notifications can be sent.
  async function AskForNotificationPermission() {
    try {
      await messaging().requestPermission();
      await ensureRemoteMessagesRegistered();
    } catch (error) {
      console.log("Error requesting notification permission", error);
    }
  }

  // const errorCallback = (_session, error) => {
  //   if (error) {
  //     // Handle the compensating write error as needed
  //     console.debug({
  //       code: error.code,
  //       name: error.name,
  //       category: error.category,
  //       message: error.message,
  //       url: error.logUrl,
  //       writes: error.writes,
  //     });

  //     if (
  //       error.code == 212 ||
  //       error.code == 209 ||
  //       error.code == 210 ||
  //       error.code == 225
  //     ) {
  //       let errorCode = realmErrors[error.code];
  //       setError(`Code ${error.code}:${errorCode}`);
  //     }
  //   }
  // };
  function InnerApp() {
    const { tokenLogin, loading } = React.useContext(AuthContext);
    const [error, setError] = React.useState("");

    console.log("AUTH TOKEN IN APP TSX:", tokenLogin);

    if (loading) return null;

    return (
      !tokenLogin ? (
        <AuthNavigator />
      ) : (
    
          <ChatProvider roomId={global.roomId || ""}>
            <LanguageProvider>
              
                <View style={{ flex: 1 }}>
                  <GlobalContainer />
            
                  <RootStack.Navigator initialRouteName="Splash">
                    <RootStack.Screen
                      name="Splash"
                      component={SplashContainer}
                      options={{ headerShown: false }}
                    />
                    <RootStack.Screen
                      name="Main"
                      component={MainNavigator}
                      options={{ headerShown: false }}
                    />
                    <RootStack.Screen
                      name="Senior"
                      component={SeniorNavigator}
                      options={{ headerShown: false }}
                    />
                  </RootStack.Navigator>
                </View>
              
            </LanguageProvider>
          </ChatProvider>
     
      )
    );
  }

  return (
    <>
      <InitialCallingContainer />
      <CheckAppVersion />
      <AuthProvider>

        <SessionInvalidationGuard />
        <InnerApp />
      </AuthProvider>
      {/* <AppProvider id={REALM_URL}>
        <UserProvider fallback={RealmLogin}>
          <RealmProvider
            fallback={<AppSync />}
            schema={[
              callSchema,
              deviceSchema,
              memberSchema,
              assignmentSchema,
              scenarioSchema,
              reminderSchema,
              versionmanagementSchema,
              organizationSchema,
              userSchema,
            ]}
            onError={(_session, error) => {
              console.error("Realm error:", error);
              setError(error.message);
              errorCallback(_session, error);
            }}
          // sync={{
          //   flexible: true,
          //   initialSubscriptions: {
          //     update(subs, realm) {
          //       subs.add(realm.objects("call"));
          //       subs.add(realm.objects("device"));
          //       subs.add(realm.objects("member"));
          //       subs.add(realm.objects("assignment"));
          //       subs.add(realm.objects("scenario"));
          //       subs.add(realm.objects("reminder"));
          //       subs.add(realm.objects("versionmanagement"));
          //       subs.add(realm.objects("organization"));
          //       subs.add(realm.objects("user"));
          //     },
          //   },
          //   onError: errorCallback,
          //   onFirstOpen: () => console.log("onFirstOpen"),
          //   existingRealmFileBehavior: openRealmBehaviorConfig,
          //   newRealmFileBehavior: { ...openRealmBehaviorConfig },
          // }}
          >
            <ChatProvider roomId={global.roomId || ""}>
              <LanguageProvider>
                {error.length > 0 ? (
                  <RealmErrorScreen message={error} />
                ) : (
                  <View style={{ flex: 1 }}>
                    <GlobalContainer />

                    <RootStack.Navigator initialRouteName="Splash">
                      <RootStack.Screen
                        name="Splash"
                        component={SplashContainer}
                        options={{ headerShown: false }}
                      />

                      <RootStack.Screen
                        name="Main"
                        component={MainNavigator}
                        options={{ headerShown: false }}
                      />

                      <RootStack.Screen
                        name="Senior"
                        component={SeniorNavigator}
                        options={{ headerShown: false }}
                      />
                    </RootStack.Navigator>
                  </View>
                )}
              </LanguageProvider>
            </ChatProvider>
          </RealmProvider>
        </UserProvider>
      </AppProvider> */}

    </>
  );
}

/**
 * Renders the authentication navigator.
 */
function RealmLogin() {
  return <AuthNavigator />;
}

/**
 * Renders the app synchronization view.
 */
export function AppSync() {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    setTimeout(() => {
      setProgress(0.7);
    }, 2500);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Image
        source={require("../../assets/images/logo.png")}
        style={{ height: 150, width: 150 }}
      />
      <Lottie
        source={require("../../assets/lottie/loader.json")}
        style={{ height: 100, width: width, marginVertical: 20 }}
        autoPlay
        loop
      />
      {/* <Progress.Bar progress={progress} width={200} /> */}
    </View>
  );
}

function CheckAppVersion() {
  const { t } = useTranslation();

  const [versionText, setVersionText] = useState<string>("");
  const RBSheetRef = useRef<RBSheetProps>(null);
  const dispatch = useDispatch();
  const [logoutRequest, { }] = useLogoutLazyQuery();
  // const user = useUser();
  const MyProfile = useAppSelector((state) => state.Chat.MyProfile);
  const setCallQueue = useSetAtom(callQueueAtom);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    fetchVersionManagement();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      const wasInBackground =
        appStateRef.current === "background" || appStateRef.current === "inactive";

      if (wasInBackground && nextState === "active") {
        fetchVersionManagement();
      }

      appStateRef.current = nextState;
    });

    return () => {
      sub.remove();
    };
  }, []);

  return (
    <View>
      <RBSheet
        height={350}
        closeOnDragDown={false}
        dragFromTopOnly={false}
        closeOnPressMask={false}
        closeOnPressBack={false}
        customStyles={{
          container: {
            borderTopRightRadius: 30,
            borderTopLeftRadius: 30,
          },
        }}
        ref={RBSheetRef}
      >
        <OtaModal
          title="New comon app version available"
          versionText={versionText}
          onExitPress={() => {
            RBSheetRef.current?.close();
            // RNExitApp.exitApp();
          }}
          onUpdatePress={() => {
            Linking.openURL(Platform.OS === "android" ? ANDROID_URL : IOS_URL);
          }}
        />
      </RBSheet>
    </View>
  );

  async function OldVersionLogout() {
    const { mode } = await getSession();
    const id = storage.getString(keys.userId);

    messaging()
      .unsubscribeFromTopic(`${mode}_user_id_${id}`)
      .then(() => {
        console.log(
          `${Platform.OS} topic unSubscribe success`,
          `${mode}_user_id_${id}`
        );
      });
    socketConnect.disconnect();
    await AsyncStorage.removeItem("roomDataCache");

    dispatch(resetOrganisationState());
    dispatch(resetContactState());
    dispatch(resetCallState());
    dispatch(resetChatState());
    setCallQueue(null);
    await logoutRequest({ variables: { input: {} } });
    removeSession();
    await AsyncStorage.removeItem("MyProfile");
    // await user?.logOut();
    storage.clearAll();
    dispatch(setMyProfile(null));
  }

  async function fetchVersionManagement() {
    try {
      const response = await fetch(
        `${PUBLIC_API}/version_management/${Platform.OS.toUpperCase()}`,
        {
          headers: {
            accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      // console.log(data)

      await setVersionTypeAsync(data);
      // const data = text ? JSON.parse(text) : text;  // Safely parse JSON only if text is not empty

      // console.log(data);
    } catch (error) {
      console.error("Error fetching version management data:", error);
    }
  }

  async function setVersionTypeAsync(source: versionmanagement | null) {
    const currentVersion = VersionCheck.getCurrentVersion();
    setVersionText(`${currentVersion}  ->  ${source?.activeVersion}`);
    if (source === null) return;

    const needUpdate = await VersionCheck.needUpdate({
      currentVersion,
      latestVersion: source.activeVersion || currentVersion,
    });

    if (source.expiredVersion?.includes(currentVersion) || needUpdate?.isNeeded) {
      setTimeout(() => {
        if (MyProfile) {
          // OldVersionLogout();
        }
      }, 5000);

      RBSheetRef.current?.open();
    }
  }
}

function SessionInvalidationGuard() {
  const dispatch = useDispatch();
  const { tokenLogin, setTokenLogin } = React.useContext(AuthContext);
  const [refreshSession] = useRefreshSessionLazyQuery({
    fetchPolicy: "network-only",
  });
  const checkingRef = useRef(false);
  const loggedOutRef = useRef(false);

  const forceLogout = React.useCallback(async (reason: string) => {
    if (loggedOutRef.current) return;
    loggedOutRef.current = true;

    console.log("Force logout:", reason);
    setTokenLogin(null);

    const { mode } = await getSession();
    const id = storage.getString(keys.userId);

    if (mode && id) {
      messaging()
        .unsubscribeFromTopic(`${mode}_user_id_${id}`)
        .catch((error) => console.log("Topic unsubscribe failed:", error));
    }

    socketConnect.disconnect();
    await AsyncStorage.removeItem("roomDataCache");
    await AsyncStorage.removeItem("MyProfile");
    await removeSession();

    dispatch(resetOrganisationState());
    dispatch(resetContactState());
    dispatch(resetCallState());
    dispatch(resetChatState());
    storage.clearAll();
    dispatch(setMyProfile(null));
  }, [dispatch, setTokenLogin]);

  const checkCurrentDevice = React.useCallback(async () => {
    if (!tokenLogin || checkingRef.current || loggedOutRef.current) return;

    const network = await NetInfo.fetch();
    if (!network.isConnected) return;

    const session = await getSession();
    if (!session?.refresh) return;

    const deviceRaw =
      storage.getString(keys.device) ||
      (await AsyncStorage.getItem("COM_ON_LOGIN_DEVICE"));

    if (!deviceRaw) return;

    let device: any;
    try {
      device = JSON.parse(deviceRaw);
    } catch (error) {
      console.log("Unable to parse stored login device:", error);
      return;
    }

    if (!device?.token) return;

    checkingRef.current = true;
    try {
      const response = await refreshSession({
        variables: {
          input: {
            refresh: session.refresh,
            plateform: Platform.OS === "ios" ? PlateformType.IOs : PlateformType.Android,
            appVersion: VersionCheck.getCurrentVersion(),
            device: { ...device, webToken: [] },
          },
        },
      });

      const activeDeviceToken = response.data?.refreshSession?.user?.device?.token;
      if (activeDeviceToken && activeDeviceToken !== device.token) {
        await forceLogout("same user logged in on another device");
      }
    } catch (error) {
      console.log("Device session check failed:", error);
    } finally {
      checkingRef.current = false;
    }
  }, [forceLogout, refreshSession, tokenLogin]);

  useEffect(() => {
    if (!tokenLogin) {
      loggedOutRef.current = false;
      return;
    }

    const socketLogoutHandler = (type: string, data: any) => {
      const eventType = String(type || data?.type || "").toLowerCase();
      if (eventType === "logout") {
        forceLogout("socket logout event");
      }
    };

    socketConnect.addMessageHandler(socketLogoutHandler as any);
    const intervalId = setInterval(checkCurrentDevice, 15000);
    checkCurrentDevice();

    const appStateSub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        checkCurrentDevice();
      }
    });

    return () => {
      socketConnect.removeMessageHandler(socketLogoutHandler as any);
      clearInterval(intervalId);
      appStateSub.remove();
    };
  }, [checkCurrentDevice, forceLogout, tokenLogin]);

  return null;
}
