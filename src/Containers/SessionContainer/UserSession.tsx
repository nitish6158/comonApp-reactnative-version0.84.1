// import React, { useEffect } from "react";
// import RealmContext from "../../schemas";
// import { useAtomValue, useSetAtom } from "jotai";
// import { useDispatch } from "react-redux";
// import { useUser } from "@realm/react";
// import { callQueueAtom } from "@/navigation/Application";
// import { ComonSyncStatus, SessionStatus } from "../HomeContainer";
// import { useLogoutLazyQuery } from "@/graphql/generated/auth.generated";
// import { getSession, removeSession } from "@/utils/session";
// import { storage } from "@/redux/backup/mmkv";
// import messaging from "@react-native-firebase/messaging";
// import { Platform } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { resetOrganisationState } from "@/redux/Reducer/OrganisationsReducer";
// import { resetContactState } from "@/redux/Reducer/ContactReducer";
// import { resetCallState } from "@/redux/Reducer/CallReducer";
// import { resetChatState, setMyProfile } from "@/redux/Reducer/ChatReducer";
// import { keys } from "@/redux/backup/keys";
// import { device as deviceType } from "@/schemas/schema";
// import { socketConnect } from "@/utils/socket/SocketConnection";
// const { useQuery, useRealm } = RealmContext;

// export default function UserSession() {
//   const realm = useRealm();
//   const setCallQueue = useSetAtom(callQueueAtom);
//   const dispatch = useDispatch();
//   const user = useUser();
//   const isSessionActive = useSetAtom(SessionStatus);
//   const realmSyncStatus = useAtomValue(ComonSyncStatus);

//   const [logoutRequest, { }] = useLogoutLazyQuery();

//   async function forceLogout() {
//     const { mode } = await getSession();
//     const id = storage.getString(keys.userId);

//     messaging()
//       .unsubscribeFromTopic(`${mode}_user_id_${id}`)
//       .then(() => {
//         console.log(`${Platform.OS} topic unSubscribe success`, `${mode}_user_id_${id}`);
//       });
//     socketConnect.disconnect();
//     await AsyncStorage.removeItem("roomDataCache");

//     dispatch(resetOrganisationState());
//     dispatch(resetContactState());
//     dispatch(resetCallState());
//     dispatch(resetChatState());
//     setCallQueue(null);
//     // await logoutRequest({ variables: { input: {} } });
//     removeSession();
//     await AsyncStorage.removeItem("MyProfile");
//     await user?.logOut();
//     storage.clearAll();
//     dispatch(setMyProfile(null));
//   }

//   useEffect(() => {
//     let listener = null;
//     if (realmSyncStatus) {
//       const id = storage.getString(keys.userId);
//       const deviceId = storage.getString(keys.deviceId);
//       console.log("REALMLISTENER:- user device listener", id);
//       listener = realm.objects("device").filtered("userId == $0 && token == $1", new Realm.BSON.ObjectID(id), deviceId);

//       listener.addListener((rawData) => {
//         if (rawData) {
//           const data = JSON.parse(JSON.stringify(rawData)) as Array<deviceType>;
//           if (data.length > 0) {
//             if (!data[0].active) {
//               setTimeout(() => {
//                 user?.callFunction("getActiveDevice", { userId: id, token: deviceId }).then((res) => {
//                   console.log("res?.result", res?.result);
//                   if (res?.result == false) {
//                     isSessionActive(false);
//                     forceLogout();
//                   } else {
//                     isSessionActive(true);
//                   }
//                 });
//               }, 3000);
//             } else {
//               isSessionActive(true);
//             }
//           }
//         }
//       });
//     }

//     return () => {
//       if (listener) {
//         console.log("REALMLISTENER:- device listener removed.");
//         listener.removeAllListeners();
//       }
//     };
//   }, [realmSyncStatus]);

//   return <></>;
// }

export default function UserSession() {
  return null;
}
