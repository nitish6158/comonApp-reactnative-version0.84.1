// import React, { useContext, useEffect } from "react";
// import RealmContext from "../../schemas";
// import { useDispatch } from "react-redux";
// import { storage } from "@/redux/backup/mmkv";
// import { keys } from "@/redux/backup/keys";
// import { User } from "realm";
// import { setMyProfile } from "@/redux/Reducer/ChatReducer";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useAtomValue } from "jotai";
// import { ComonSyncStatus } from "../HomeContainer";
// import { languagePersister, setLanguage } from "@/redux/Reducer/LanguageReducer";
// import { Language } from "@/graphql/generated/types";
// import { LanguageContext } from "@/Context";
// const { useQuery, useRealm } = RealmContext;

// export default function UserSessionData() {
//   const realm = useRealm();
//   const dispatch = useDispatch();
//   const realmSyncStatus = useAtomValue(ComonSyncStatus);
//   const {onSelect} = useContext(LanguageContext)

//   useEffect(() => {
//     let listener = null;
//     if (realmSyncStatus) {
//       const userString = storage.getString(keys.user);
//       if (userString) {
//         const user = JSON.parse(userString) as User;
//         listener = realm.objects("user").filtered("phone == $0", user?.phone);
//         // If user did auto login or new login then add listerner for user data.
//         console.log("REALMLISTENER:- user profile listener:-", user?.phone);
//         listener.addListener((rawData) => {
//           const data = JSON.parse(JSON.stringify(rawData)) as Array<User>;
//           if (data.length > 0) {
//             const currentUser = data[0];
//             const saveData = JSON.stringify(currentUser);
//             dispatch(setMyProfile(currentUser));
//             // let languagesString = storage.getString(keys.languages)
//             // if (languagesString) {
//             //   let languages = JSON.parse(languagesString) as Language[]
//             //   let find = languages.find((v) => v._id == currentUser.language);
//             //   console.log("user language",find)
//             //   if (find) {
//             //     dispatch(setLanguage(find.code));
//             //     onSelect(find);
//             //   }
//             // }
//             AsyncStorage.setItem("MyProfile", saveData);
//             storage.set(keys.user, saveData);
//             storage.set(keys.userId, currentUser._id.toString());
//           }
//         });
//       }
//     }

//     return () => {
//       if (listener) {
//         console.log("REALMLISTENER:- user profile listener removed");
//         listener.removeAllListeners();
//       }
//     };
//   }, [realmSyncStatus]);

//   return <></>;
// }

export default function UserSessionData() {
  return null;
}
