// import React, { useEffect, useState } from "react";
// import RealmContext from "../../schemas";
// import { useAtomValue, useSetAtom } from "jotai";
// import { InternetAtom } from "@/Atoms";
// import { ComonSyncStatus } from "../HomeContainer";
// import { useTranslation } from "react-i18next";
// import { AskPermissions } from "@/hooks/useAskPermission";
// import { ActivityIndicator, Text, View } from "react-native";
// import { Colors } from "@/Constants";
// const { useQuery, useRealm } = RealmContext;
// export default function RealmSyncContainer() {
//   const realm = useRealm();
//   const [downloadProgressPercent, setDownloadProgressPercent] = useState(0);
//   const connected = useAtomValue(InternetAtom);
//   const realmSyncStatus = useSetAtom(ComonSyncStatus);


//   useEffect(() => {
//     AskPermissions(t);
//     AddDownloadingListener();
//     StartDownloadingChanges();
//   }, []);

//   function StartDownloadingChanges() {
//     realm.syncSession?.downloadAllServerChanges().then((res) => {
//       console.log("downloadAllServerChanges");
//       setTimeout(() => {
//         realmSyncStatus(true);
//       }, 3000);
//     });
//   }

//   function AddDownloadingListener() {
//     const progressNotificationCallback: Realm.ProgressNotificationCallback = (transferred, transferable) => {
//       const percentTransferred = transferred / transferable;
//       // console.log(`${transferred} / ${transferable}`)
//       setDownloadProgressPercent(percentTransferred);
//     };

//     realm.syncSession?.addProgressNotification("download", "reportIndefinitely", progressNotificationCallback);

//     return () => realm.syncSession?.removeProgressNotification(progressNotificationCallback);
//   }

//   if (!connected || downloadProgressPercent == 1) {
//     return <></>;
//   }

//   return <></>;
// }


import { AskPermissions } from "@/hooks/useAskPermission";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
export default function SyncContainer() {
  const { t } = useTranslation();
  useEffect(() => {
    AskPermissions(t);

  }, []);

  return null;
}