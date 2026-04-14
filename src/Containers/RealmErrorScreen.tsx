import { View, Text, Linking, Platform } from "react-native";
import React from "react";
import { windowHeight } from "@/utils/ResponsiveView";
import ExitApp from "react-native-exit-app";
import { LogoTitle } from "@/Components/logo";
import FastImage from "@d11/react-native-fast-image";
import { Button, Chip } from "react-native-ui-lib";
import { ANDROID_URL, IOS_URL } from "@/graphql/provider/endpoints";
import { Colors } from "@/Constants";
import { useAppSelector } from "@/redux/Store";
import { useGetVersionDetailsQuery } from "@/graphql/generated/version.generated";
import { useTranslation } from "react-i18next";

type props = {
  message: string;
};

export default function RealmErrorScreen({ message }: props) {
  const versionData = useGetVersionDetailsQuery({ variables: { input: { type: Platform.OS.toUpperCase() } } });
  const { t } = useTranslation();

  return (
    <View
      style={{
        height: windowHeight,
        backgroundColor: "white",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 30,
        flex: 1,
      }}
    >
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <FastImage
          source={require("../../assets/images/logo.png")}
          style={{ height: 150, width: 150, borderRadius: 75 }}
        />
        <View style={{ justifyContent: "center", alignItems: "center", marginTop: 50 }}>
          <Text style={{ color: Colors.light.PrimaryColor, fontSize: 28, fontWeight: "700" }}>
            {t("onlineStatus.major-update")}
          </Text>
          <Text style={{ fontSize: 16, width: 330, textAlign: "center", marginTop: 30, marginBottom: 10 }}>
            {t("onlineStatus.major-update-des")}
          </Text>

          <Chip label={`${t("onlineStatus.stable-version")}: ${versionData.data?.getVersionDetails.activeVersion}`} />
        </View>
      </View>

      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Button
          backgroundColor={Colors.light.PrimaryColor}
          label={`${t("onlineStatus.uninstall-app")}`}
          onPress={() => {
            Linking.openURL(Platform.OS == "android" ? ANDROID_URL : IOS_URL);
          }}
          style={{ width: 300 }}
        />
        <Text
          style={{ marginTop: 30, color: Colors.light.PrimaryColor, fontSize: 16 }}
          onPress={() => {
            ExitApp.exitApp();
          }}
        >
          {t("onlineStatus.close-app")}
        </Text>
      </View>
    </View>
  );
}
