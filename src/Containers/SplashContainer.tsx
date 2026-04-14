// import { AppState, Dimensions, Image, Linking, Platform, View, Text } from "react-native";
// import RNVoipCall, { RNVoipPushKit } from "react-native-voips-calls";

// import React, { useEffect, useState, useRef, useContext } from "react";
// import { getSession, removeSession, setSession } from "../utils/session";
// import { useApp, useUser } from "@realm/react";

// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Lottie from "lottie-react-native";
// import NetInfo from "@react-native-community/netinfo";
// import { PlateformType } from "../graphql/generated/types";
// import ToastMessage from "../utils/ToastMesage";
// import { asyncStorageKeys } from "@/Constants/asyncStorageKeys";

// import { currentUserIdAtom } from "../Atoms/RealmloginManager";
// import messaging from "@react-native-firebase/messaging";
// import { navigateAndSimpleReset } from "../navigation/utility";
// import { useAtom, useSetAtom } from "jotai";
// import * as Progress from "react-native-progress";

// import { useRefreshSessionLazyQuery } from "../graphql/generated/auth.generated";

// import { z } from "zod";
// import { useDispatch } from "react-redux";
// import { deviceUniqueID } from "@/navigation/Application";
// import { useTranslation } from "react-i18next";
// import VersionCheck from "react-native-version-check";
// import { useAppSelector } from "@/redux/Store";
// import RealmContext from "../schemas";
// import { BSON } from "realm";
// import { resetChatState, setMyProfile } from "@/redux/Reducer/ChatReducer";
// import { storage } from "@/redux/backup/mmkv";
// import { keys } from "@/redux/backup/keys";
// import {
//   addServerContact,
//   removeContact,
//   resetContactState,
//   serverContactType,
//   updateContact,
//   updateContactProfile,
// } from "@/redux/Reducer/ContactReducer";
// import { addContact, usePhoneContext, formattedPhoneBook } from "@/hooks";
// import {
//   useAddMyContactMutation,
//   useDeleteMyContactMutation,
//   useGetUserPhoneBookLazyQuery,
// } from "@/graphql/generated/contact.generated";
// import { ContactDetailsDto } from "@/graphql/generated/database.generated";
// import { Colors } from "@/Constants";
// import FastImage from "@d11/react-native-fast-image";
// import { resetOrganisationState } from "@/redux/Reducer/OrganisationsReducer";
// import { resetCallState } from "@/redux/Reducer/CallReducer";
// import { Button, Dialog } from "react-native-ui-lib";
// import ExitApp from "react-native-exit-app";
// import { LanguageContext } from "@/Context";
// import { socketConnect } from "@/utils/socket/SocketConnection";

// const IsIos = Platform.OS === "ios";

// type AuthType = {
//   token: string | null;
//   refresh: string | null;
//   expireAt: string | null;
//   mode: string | null;
// };

// const refreshType = z.object({
//   refresh: z.string(),
//   plateform: z.string(),
// });

// const internetConnectivity = {
//   isConnected: false,
//   isReachable: false,
// };

// NetInfo.addEventListener((state) => {
//   internetConnectivity.isConnected = state.isConnected;
//   internetConnectivity.isReachable = state.isInternetReachable;
// });

// export default function SplashContainer() {
//   console.log("🚀 SPLASH MOUNTED");

//   const dispatch = useDispatch();
//   const setDeviceUniqueID = useSetAtom(deviceUniqueID);
//   const user = useUser();
//   const [token, setToken] = useState<AuthType | null>(null);
//   console.log("🚀 SPLASH TOKEN:", token);
//   const [currentUserData, setCurrentUserData] = useAtom(currentUserIdAtom);

//   const [refreshRequest, refreshResponse] = useRefreshSessionLazyQuery();
//   const [addMyContactRequest] = useAddMyContactMutation();
//   const [deleteMyContactRequest] = useDeleteMyContactMutation();

//   const [error, setError] = useState<boolean>(false);
//   const [payload, setPayload] = useState(null);

//   const { code } = usePhoneContext();
//   const userModeRef = useRef<string>("");

//   const [percentage, setPercentage] = useState<number>(0);
//   const [PermissionModal, setPermissionModal] = useState<boolean>(false);

//   const [getServerPhonebook] = useGetUserPhoneBookLazyQuery();
//   const { languages } = useAppSelector(state => state.appLanguage);
//   const { onSelect } = useContext(LanguageContext);
//   const { t } = useTranslation();

//   useEffect(() => {
//     console.log("🟡 INIT — checking login + pushkit");
//     checkForCurrentDeviceLoginStatus();
//     iosPushKit();
//   }, []);

//   useEffect(() => {
//     if (refreshResponse.error) {
//       console.log("🔥 REFRESH ERROR:", refreshResponse.error);
//       logoutUser();
//       ToastMessage(t("label.token-expired"));
//     }
//   }, [refreshResponse.data?.refreshSession, refreshResponse.error]);

//   async function tryAutoContactSync() {
//     try {
//       console.log("📱 SPLASH → AUTO CONTACT SYNC START");

//       // 1️⃣ Read mobile contacts
//       const phoneBookContacts = await addContact(t);

//       if (!phoneBookContacts || phoneBookContacts.length === 0) {
//         console.log("⚠️ No phone contacts found");
//         return;
//       }

//       // 2️⃣ Send contacts to server
//       await addMyContactRequest({
//         variables: {
//           input: {
//             region: code,
//             contacts: phoneBookContacts.map(item => ({
//               id: item.localId,
//               numbers: item.phone,
//               firstName: item.name ?? "",
//               lastName: item.lastName ?? "",
//             })),
//           },
//         },
//       });

//       console.log("✅ SPLASH → CONTACT SYNC SUCCESS");
//     } catch (error) {
//       console.log("❌ SPLASH → CONTACT SYNC FAILED", error);
//       // ❌ yahan kuch bhi mat dikhao
//       // ❌ no toast
//       // ❌ no navigation stop
//     }
//   }

//   function HandleRefreshSucess(data) {
//     console.log("🎯 REFRESH SUCCESS DATA:", data);

//     const { user, contacts, ...refreshSession } = data;
//     userModeRef.current = user?.mode;

//     console.log("🎛 USER MODE:", userModeRef.current);

//     setSession(refreshSession);
//     socketConnect.connect();

//     if (user) {
//       storage.set(keys.userId, user?._id);
//       setCurrentUserData(user);
//       dispatch(setMyProfile(user));

//       dispatch(updateContactProfile(contacts));

//       setPercentage(0.3);

//       ContactSync().then(async (list) => {
//         console.log("📞 CONTACT SYNC LIST:", list?.length);
//         // await tryAutoContactSync();
//         if (list) {
//           setPercentage(0.5);
//           syncContactsToDb(list);
//         }
//       });
//     }
//   }
//   // function HandleRefreshSucess(data) {
//   //   const { user } = data;

//   //   dispatch(setMyProfile(user));

//   //   if (user.mode === "CLASSIC") {
//   //     navigateAndSimpleReset("Main", {});
//   //   } else {
//   //     navigateAndSimpleReset("Senior", {});
//   //   }
//   // }
//   async function logoutUser() {
//     console.log("🚪 LOGOUT CALLED");
//     removeSession();
//     setToken(null);
//     await user?.logOut();
//     storage.clearAll();
//     dispatch(setMyProfile(null));
//   }

//   async function checkForCurrentDeviceLoginStatus() {
//     console.log("🟡 STEP 1: Checking session...");

//     const sessionData = await getSession();
//     console.log("📝 SESSION DATA:", sessionData);

//     if (sessionData?.refresh) {
//       console.log("🔐 SESSION FOUND");
//       setToken(sessionData);
//       console.log("🌐 INTERNET:", internetConnectivity);

//       if (internetConnectivity.isConnected) {
//         console.log("📡 Calling refresh API...");
//         const payload = {
//           refresh: sessionData.refresh,
//           plateform: Platform.OS ? PlateformType.IOs : PlateformType.Android,
//           appVersion: VersionCheck.getCurrentVersion(),
//         };

//         let device = storage.getString(keys.device);
//         console.log("📦 DEVICE:", device);

//         refreshRequest({ variables: { input: { ...payload, device: JSON.parse(device || "{}") } } })
//           .then((res) => {
//             console.log("✅ REFRESH RESPONSE:", res?.data);

//             if (res.data?.refreshSession) {
//               HandleRefreshSucess(res.data?.refreshSession);
//             }
//           })
//           .catch(err => console.log("🔥 REFRESH API ERROR", err));
//       } else {
//         console.log("📴 OFFLINE → GO MAIN");
//         navigateAndSimpleReset("Main", {});
//       }
//     } else {
//       console.log("❌ NO SESSION → LOGOUT");
//       logoutUser();
//     }
//   }
//   //   async function checkForCurrentDeviceLoginStatus() {
//   //     console.log("🟡 STEP 1: Checking session...");
//   //     const sessionData = await getSession();
//   //  console.log("🟡 STEP 1: Checking session...1");
//   //     // ❌ no session → go login
//   //     if (!sessionData?.refresh) {
//   //        console.log("🟡 STEP 1: Checking session...2");
//   //       // navigateAndSimpleReset("Auth", {});
//   //       // return;
//   //       logoutUser();
//   //       setToken(null); // 👈 instead of navigation
//   //       return;
//   //     }

//   //     // 🌐 If internet — refresh token
//   //     if (internetConnectivity.isConnected) {
//   //        console.log("🟡 STEP 1: Checking session...3");
//   //       const payload = {
//   //         refresh: sessionData.refresh,
//   //         plateform: Platform.OS === "ios" ? "iOS" : "ANDROID",
//   //         appVersion: VersionCheck.getCurrentVersion(),
//   //       };

//   //       refreshRequest({ variables: { input: payload } })
//   //         .then(res => {
//   //           if (res.data?.refreshSession) {
//   //             HandleRefreshSucess(res.data.refreshSession);
//   //           } else {
//   //             // navigateAndSimpleReset("Auth", {});
//   //             logoutUser();
//   //             setToken(null);
//   //           }
//   //         })
//   //         .catch(() =>{logoutUser(), setToken(null)});
//   //         // .catch(() => navigateAndSimpleReset("Auth", {}));
//   //     }

//   //     // 📴 offline → still allow entry
//   //     else {
//   //       navigateAndSimpleReset("Main", {});
//   //     }
//   //   }

//   function iosPushKit() {
//     if (IsIos) {
//       RNVoipPushKit.getPushKitDeviceToken(async (res) => {
//         console.log("📲 PUSHKIT TOKEN", res);
//       });
//     }
//   }

//   async function ContactSync() {
//     console.log("📥 FETCHING CONTACTS...");
//     const res = await getServerPhonebook();
//     console.log("📥 CONTACT RESPONSE:", res.data);
//     return res.data?.getUserPhoneBook?.contacts ?? [];
//   }

//   async function syncContactsToDb(serverContact) {
//     console.log("🔄 SYNC CONTACTS TO DB");

//     setPercentage(1);
//     console.log("🎚 MODE BEFORE NAV:", userModeRef.current);

//     if (userModeRef.current === "CLASSIC") navigateAndSimpleReset("Main", {});
//     if (userModeRef.current === "SENIORCITIZEN") navigateAndSimpleReset("Senior", {});
//   }

//   return (
//     <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" }}>
//       <FastImage
//         source={require("../../assets/images/logo.png")}
//         style={{ height: 210, width: 210, marginBottom: 130 }}
//       />

//       <Progress.Bar progress={percentage} width={200} color={Colors.light.PrimaryColor} />
//     </View>
//   );
// }
import { AppState, Dimensions, Image, Linking, Platform, View, Text } from "react-native";
import RNVoipCall, { RNVoipPushKit } from "react-native-voips-calls";
import React, { useEffect, useState, useRef, useContext } from "react";
import { getSession, removeSession, setSession } from "../utils/session";

import AsyncStorage from "@react-native-async-storage/async-storage";
import Lottie from "lottie-react-native";
import NetInfo from "@react-native-community/netinfo";
import { PlateformType } from "../graphql/generated/types";
import ToastMessage from "../utils/ToastMesage";
import { asyncStorageKeys } from "@/Constants/asyncStorageKeys";

import { currentUserIdAtom } from "../Atoms/RealmloginManager";
import messaging from "@react-native-firebase/messaging";
import { navigateAndSimpleReset } from "../navigation/utility";
import { useAtom, useSetAtom } from "jotai";
import * as Progress from "react-native-progress";

import { useRefreshSessionLazyQuery } from "../graphql/generated/auth.generated";

import { z } from "zod";
import { useDispatch } from "react-redux";
import { deviceUniqueID } from "@/navigation/Application";
import { useTranslation } from "react-i18next";
import VersionCheck from "react-native-version-check";
import DeviceInfo from "react-native-device-info";
import { useAppSelector } from "@/redux/Store";
import { resetChatState, setMyProfile } from "@/redux/Reducer/ChatReducer";
import { storage } from "@/redux/backup/mmkv";
import { keys } from "@/redux/backup/keys";
import {
  addServerContact,
  removeContact,
  resetContactState,
  serverContactType,
  updateComonContact,
  updateContact,
  updateContactProfile,
} from "@/redux/Reducer/ContactReducer";
import { addContact, usePhoneContext } from "@/hooks";
import {
  useAddMyContactMutation,
  useDeleteMyContactMutation,
  useGetUserPhoneBookLazyQuery,
} from "@/graphql/generated/contact.generated";
import { ContactDetailsDto } from "@/graphql/generated/database.generated";
import { Colors } from "@/Constants";
import FastImage from "@d11/react-native-fast-image";
import { resetOrganisationState } from "@/redux/Reducer/OrganisationsReducer";
import { resetCallState } from "@/redux/Reducer/CallReducer";
import { Button, Dialog } from "react-native-ui-lib";
import ExitApp from "react-native-exit-app";
import { useGetLanguageListQuery } from "@/graphql/generated/user.generated";
import { setLanguage, setLanguageList } from "@/redux/Reducer/LanguageReducer";
import { LanguageContext } from "@/Context";
import useFileSystem from "@/hooks/useFileSystem";
import { socketConnect } from "@/utils/socket/SocketConnection";
import { AuthContext, AuthProvider } from "@/Components/AuthContext";
// import { connectToSocket } from "@/redux/Reducer/SocketSlice";

const IsIos = Platform.OS === "ios";

type AuthType = {
  token: string | null;
  refresh: string | null;
  expireAt: string | null;
  mode: string | null;
};

const refreshType = z.object({
  refresh: z.string(),
  plateform: z.string(),
});

const internetConnectivity = {
  isConnected: false,
  isReachable: false,
};

NetInfo.addEventListener((state) => {
  internetConnectivity.isConnected = state.isConnected;
  internetConnectivity.isReachable = state.isInternetReachable;
});

async function getOrCreateStoredDevice() {
  const storedDevice = storage.getString(keys.device);

  if (storedDevice) {
    return JSON.parse(storedDevice);
  }

  const fcmToken = await messaging().getToken().catch(() => null);
  const uniqueId = await DeviceInfo.getUniqueId().catch(() => null);

  if (!uniqueId) {
    return null;
  }

  const fallbackDevice = {
    token: Platform.OS === "ios" ? fcmToken : uniqueId,
    fcmToken: fcmToken,
    type: Platform.OS === "ios" ? "iOS" : "ANDROID",
  };

  storage.set(keys.device, JSON.stringify(fallbackDevice));
  return fallbackDevice;
}

export default function SplashContainer() {
  const dispatch = useDispatch();
  const setDeviceUniqueID = useSetAtom(deviceUniqueID);
  const { setTokenLogin, tokenLogin } = React.useContext(AuthContext);
  const [token, setToken] = useState<AuthType | null>(null);
  const [currentUserData, setCurrentUserData] = useAtom(currentUserIdAtom);
  const DownloadFileStore = useAppSelector(state => state.Chat.DownloadFileStore)

  const [refreshRequest, refreshResponse] = useRefreshSessionLazyQuery();

  const [addMyContactRequest, addMyContactResponse] = useAddMyContactMutation();
  const [deleteMyContactRequest, deleteResponse] = useDeleteMyContactMutation();
  const [error, setError] = useState<boolean>(false);

  const [payload, setPayload] = useState(null);
  const { code } = usePhoneContext();
  const userModeRef = useRef<string>("");
  const [percentage, setPercentage] = useState<number>(0);
  const [PermissionModal, setPermissionModal] = useState<boolean>(false);

  const [getServerPhonebook, getServerPhonebookResponse] = useGetUserPhoneBookLazyQuery();

  const { languages } = useAppSelector(state => state.appLanguage)
  const { onSelect } = useContext(LanguageContext);

  const { t } = useTranslation();

  useEffect(() => {
    checkForCurrentDeviceLoginStatus();
    iosPushKit();

  }, []);



  useEffect(() => {
    if (refreshResponse.error) {
      console.log(refreshResponse.error);
      logoutUser();

      ToastMessage(t("label.token-expired"));
    }
  }, [refreshResponse.data?.refreshSession, refreshResponse.error]);


  function HandleRefreshSucess(data) {
    console.log("Splash rerender.");
    const { __typename, isMasterAdmin, user, contacts, ...refreshSession } = data;

    AsyncStorage.setItem("token", refreshSession.token);
    storage.set(keys.token, JSON.stringify(refreshSession));

    setSession(refreshSession);
    console.log("subscribe", `${refreshSession.mode}_user_id_${user?._id}`);
    messaging().subscribeToTopic(`${refreshSession.mode}_user_id_${user?._id}`);
    // dispatch(connectToSocket(refreshSession.token));
    // console.log(contacts?.length);

    socketConnect.connect();

    if (user) {
      storage.set(keys.userId, user?._id);
      storage.set(keys.user, JSON.stringify(user));
      setCurrentUserData(user);
      dispatch(setMyProfile(user));

      if (languages) {
        let find = languages.find((v) => v._id == user.language);
        if (find) {
          dispatch(setLanguage(find.code));
          onSelect(find);
        }
      }
      dispatch(updateContactProfile(contacts));
      userModeRef.current = user.mode;
      setPercentage(0.3);
      ContactSync().then(async (list) => {
        if (list) {
          setPercentage(0.5);
          syncContactsToDb(list);
        }
      });
    }
  }

  async function logoutUser() {
    setTokenLogin(null)
    const { mode } = await getSession();
    const id = storage.getString(keys.userId);

    messaging()
      .unsubscribeFromTopic(`${mode}_user_id_${id}`)
      .then(() => {
        console.log(`${Platform.OS} topic unSubscribe success`, `${mode}_user_id_${id}`);
      });
    socketConnect.disconnect();
    await AsyncStorage.removeItem("roomDataCache");

    dispatch(resetOrganisationState());
    dispatch(resetContactState());
    dispatch(resetCallState());
    dispatch(resetChatState());
    // await logoutRequest({ variables: { input: {} } });
    removeSession();
    await AsyncStorage.removeItem("MyProfile");
    storage.clearAll();
    dispatch(setMyProfile(null));
  }

  async function checkForCurrentDeviceLoginStatus() {
    const sessionData = await getSession();

    if (sessionData?.refresh) {
      // console.log("sessionData", sessionData);
      setToken(sessionData);
      if (internetConnectivity.isConnected) {
        //user logged-in so check that user logged-in on other device or not
        const payload = {
          refresh: sessionData.refresh,
          plateform: Platform.OS === "ios" ? "iOS" : "ANDROID",
          appVersion: VersionCheck.getCurrentVersion(),
        };

        const isPayload = refreshType.safeParse(payload);
        const value = await getOrCreateStoredDevice();
        if (isPayload.success && value?.token) {
          storage.set(keys.deviceId, value.token);

          refreshRequest({
            variables: {
              input: { ...payload, device: { ...value, webToken: [] } },
            },
          })
            .then((res) => {
              if (res.data?.refreshSession) {
                const isActiveDevice = res.data?.refreshSession.user?.device?.token == value.token;
                if (isActiveDevice) {
                  HandleRefreshSucess(res.data?.refreshSession);
                } else {
                  logoutUser();
                }
              }
            })
            .catch(console.log);
        } else {
          console.log("Missing device payload on splash, logging out");
          logoutUser();
        }
      } else {
        //offline mode
        navigateAndSimpleReset("Main", {});
      }
    } else {
      //if any user exist then logout the user
      //after logout it automatically moves to "Auth navigator"
      console.log("realm logout", sessionData);
      logoutUser();
    }
  }

  function iosPushKit() {
    if (IsIos) {
      RNVoipPushKit.getPushKitDeviceToken(async (res) => {
        if (res.platform === "ios") {
          const deviceToken = await AsyncStorage.getItem(asyncStorageKeys.deviceToken);
          if (deviceToken) {
            if (deviceToken !== res.deviceToken) {
              await AsyncStorage.setItem(asyncStorageKeys.deviceToken, res.deviceToken);
            }
          } else {
            await AsyncStorage.setItem(asyncStorageKeys.deviceToken, res.deviceToken);
          }
          setDeviceUniqueID(res.deviceToken);
        }
      });
    }
  }

  function deleteContacts(contactsToDelete: ContactDetailsDto[]) {
    if (!contactsToDelete.length) return;
    const deleteContact = contactsToDelete.map((e) => e?.localId);
    deleteMyContactRequest({
      variables: {
        input: {
          contactIds: deleteContact,
        },
      },
    }).then((res) => {
      if (res.data?.deleteMyContact?.data) {
        dispatch(removeContact(res.data?.deleteMyContact.data));
      }
    });
  }

  async function ContactSync() {
    try {
      const res = await getServerPhonebook();
      if (res.data?.getUserPhoneBook) {
        const contactsRaw = res.data?.getUserPhoneBook?.contacts ?? [];

        if (contactsRaw.length > 0) {
          dispatch(updateContact(contactsRaw));
          return contactsRaw;
        } else {
          dispatch(updateContact([]));
          return [];
        }
      } else {
        console.log(error);
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async function syncContactsToDb(serverContact: serverContactType[]) {
    addContact(t)
      .then((phonebook) => {
        const RemoveFromServer = serverContact.filter((e: { localId: string }) => {
          //If contact not found on server then add to the list
          const isFound = phonebook.find((v) => v.localId === e.localId);
          if (!isFound) {
            return true;
          } else {
            return false;
          }
        });

        if (RemoveFromServer.length > 0) {
          deleteContacts(RemoveFromServer);
        }

        const AddToServer = phonebook.filter((e: { localId: string }) => {
          //If contact not found on server then add to the list
          const isFound = serverContact.find((v) => v.localId === e.localId);
          if (!isFound) {
            return true;
          } else {
            return false;
          }
        });

        if (AddToServer.length > 0) {
          const contacts = AddToServer.map((item) => ({
            id: item?.localId,
            numbers: item?.phone,
            firstName: item?.name ? item?.name : item?.firstName ? item?.firstName : "",
            lastName: item.lastName,
          }));

          console.log({
            region: code,
            contacts: contacts.length,
          });
          setPercentage(0.7);
          addMyContactRequest({
            variables: {
              input: {
                region: code,
                contacts: contacts,
              },
            },
          })
            .then((response) => {
              if (response.data?.addMyContact) {
                console.log(response.data?.addMyContact.contacts?.length);
                dispatch(addServerContact(response.data?.addMyContact.contacts));
              }
              console.log("userModeRef", userModeRef.current);
              setPercentage(1);
              if (userModeRef.current == "CLASSIC") {
                navigateAndSimpleReset("Main", {});
              }
              if (userModeRef.current == "SENIORCITIZEN") {
                navigateAndSimpleReset("Senior", {});
              }
            })
            .catch((err) => {
              console.log(err);
              setPayload({
                region: code,
                contacts: contacts,
              });
              setError(true);
              console.log("userModeRef", userModeRef.current);
              setPercentage(1);
              if (userModeRef.current == "CLASSIC") {
                navigateAndSimpleReset("Main", {});
              }
              if (userModeRef.current == "SENIORCITIZEN") {
                navigateAndSimpleReset("Senior", {});
              }
            });
        } else {
          console.log("userModeRef", userModeRef.current);
          setPercentage(1);
          if (userModeRef.current == "CLASSIC") {
            navigateAndSimpleReset("Main", {});
          }
          if (userModeRef.current == "SENIORCITIZEN") {
            navigateAndSimpleReset("Senior", {});
          }
        }
      })
      .catch(() => {
        // ToastMessage("Contact Sync Skipped. You can try manually later.");
        setPermissionModal(true);
      });
  }

  function onGoToSetting() {
    Linking.openSettings();
    // ExitApp.exitApp();
  }

  function onAppClose() {
    ExitApp.exitApp();
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" }}>
      <FastImage
        source={require("../../assets/images/logo.png")}
        style={{ height: 210, width: 210, marginBottom: 130 }}
      />

      <Progress.Bar progress={percentage} width={200} color={Colors.light.PrimaryColor} />
      <Dialog
        visible={PermissionModal}
        overlayBackgroundColor="white"
        containerStyle={{ justifyContent: "space-between", paddingVertical: 40 }}
        ignoreBackgroundPress={true}
      >
        <Text style={{ fontSize: 18, textAlign: "center", marginBottom: 15, fontWeight: "500", marginBottom: 150 }}>
          You can not use Comon app without Allowing for contact permission. Please allow contact permission in
          settings.
        </Text>
        <View>
          <Button
            label={"Go to settings"}
            style={{ borderRadius: 20, backgroundColor: Colors.light.PrimaryColor }}
            labelStyle={{ color: "white" }}
            onPress={onGoToSetting}
          />
          <Button
            label={"Close App"}
            style={{ borderRadius: 20, marginTop: 30, backgroundColor: Colors.light.PrimaryColor }}
            labelStyle={{ color: "white" }}
            onPress={onAppClose}
          />
        </View>
      </Dialog>
    </View>
  );
}

// <Lottie
//   source={require("../../assets/lottie/loader.json")}
//   style={{ height: 100, width: width, marginVertical: 20 }}
//   autoPlay
//   loop
// />
