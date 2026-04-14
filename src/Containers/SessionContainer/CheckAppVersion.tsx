// import React, { useEffect, useRef, useState } from "react";
// import RealmContext from "../../schemas";
// import { useTranslation } from "react-i18next";
// import { AppState, Linking, Platform, View } from "react-native";
// import { useAtom } from "jotai";
// import { appStateAtom } from "@/Atoms/appLifeCycleAtom";
// import RBSheet, { RBSheetProps } from "react-native-raw-bottom-sheet";
// import { versionmanagement } from "@/schemas/schema";
// import OtaModal from "react-native-ota-modal";
// import RNExitApp from "react-native-exit-app";
// import { ANDROID_URL, IOS_URL } from "@/graphql/provider/endpoints";
// import VersionCheck from "react-native-version-check";

// const { useQuery, useRealm } = RealmContext;

// export function CheckAppVersion() {
//   const appVersion = useQuery("versionmanagement");
//   const { t } = useTranslation();
//   const [appState, setAppState] = useAtom(appStateAtom);
//   const [versionText, setVersionText] = useState<string>("");
//   const RBSheetRef = useRef<RBSheetProps>(null);

//   useEffect(() => {
//     AppState.addEventListener("change", setAppState);
//   }, []);

//   useEffect(() => {
//     let versions = JSON.parse(JSON.stringify(appVersion)) as versionmanagement[];
//     let IOSVersion = versions.find((v) => v.type === "IOS") ?? null;
//     let AndroidVersion = versions.find((v) => v.type === "ANDROID") ?? null;
//     setVersionTypeAsync(Platform.OS == "android" ? AndroidVersion : IOSVersion);
//   }, [appVersion, appState]);

//   return (
//     <View>
//       <RBSheet
//         height={350}
//         closeOnDragDown={false}
//         dragFromTopOnly={false}
//         closeOnPressMask={false}
//         closeOnPressBack={false}
//         customStyles={{
//           container: {
//             borderTopRightRadius: 30,
//             borderTopLeftRadius: 30,
//           },
//         }}
//         ref={RBSheetRef}
//       >
//         <OtaModal
//           title="New comon app version available"
//           versionText={versionText}
//           onExitPress={() => {
//             RBSheetRef.current?.close()
//             // RNExitApp.exitApp();
//           }}
//           onUpdatePress={() => {
//             Linking.openURL(Platform.OS === "android" ? ANDROID_URL : IOS_URL);
//           }}
//         />
//       </RBSheet>
//     </View>
//   );

//   function setVersionTypeAsync(source: versionmanagement | null) {
//     const currentVersion = VersionCheck.getCurrentVersion();
//     setVersionText(`${currentVersion}  ->  ${source?.activeVersion}`);
//     if (source === null) return;

//     if (source.expiredVersion?.includes(currentVersion)) {
//       RBSheetRef.current?.open();
//     }
//   }
// }
import React, { useEffect, useRef, useState } from "react";
import { AppState, Linking, Platform, View } from "react-native";
import { useAtom } from "jotai";
import { appStateAtom } from "@/Atoms/appLifeCycleAtom";
import RBSheet, { RBSheetProps } from "react-native-raw-bottom-sheet";
import OtaModal from "react-native-ota-modal";
import { ANDROID_URL, IOS_URL } from "@/graphql/provider/endpoints";
import VersionCheck from "react-native-version-check";

// ✅ Temporary Version Type
type VersionType = {
  type: "IOS" | "ANDROID";
  activeVersion: string;
  expiredVersion: string[];
};

export function CheckAppVersion() {
  const [appState, setAppState] = useAtom(appStateAtom);
  const [versionText, setVersionText] = useState("");
  const RBSheetRef = useRef<RBSheetProps>(null);

  // ✅ TEMP DATA (Backend / Realm ki jagah)
  const TEMP_VERSIONS: VersionType[] = [
    {
      type: "ANDROID",
      activeVersion: "1.0.0",
      expiredVersion: ["0.9.0", "0.8.0"],
    },
    {
      type: "IOS",
      activeVersion: "1.0.0",
      expiredVersion: ["0.9.0"],
    },
  ];

  useEffect(() => {
    const sub = AppState.addEventListener("change", setAppState);

    return () => {
      sub.remove();
    };
  }, []);

  useEffect(() => {
    const iosVersion =
      TEMP_VERSIONS.find((v) => v.type === "IOS") ?? null;

    const androidVersion =
      TEMP_VERSIONS.find((v) => v.type === "ANDROID") ?? null;

    setVersionTypeAsync(
      Platform.OS === "android" ? androidVersion : iosVersion
    );
  }, [appState]);

  return (
    <View>
      <RBSheet
        height={350}
        closeOnDragDown={false}
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
          title="New app version available"
          versionText={versionText}
          onExitPress={() => {
            RBSheetRef.current?.close();
          }}
          onUpdatePress={() => {
            Linking.openURL(
              Platform.OS === "android" ? ANDROID_URL : IOS_URL
            );
          }}
        />
      </RBSheet>
    </View>
  );

  // ✅ Version Check Logic
  function setVersionTypeAsync(source: VersionType | null) {
    if (!source) return;

    const currentVersion = VersionCheck.getCurrentVersion();

    setVersionText(
      `${currentVersion}  →  ${source.activeVersion}`
    );

    // If app is expired → force update
    if (source.expiredVersion.includes(currentVersion)) {
      RBSheetRef.current?.open();
    }
  }
}
