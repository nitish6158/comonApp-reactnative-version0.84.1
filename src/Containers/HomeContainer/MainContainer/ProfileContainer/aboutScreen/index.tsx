import { View, Text, StyleSheet, StatusBar, Pressable, Linking } from "react-native";
import React from "react";
import HeaderWithBack from "@Components/header/HeaderWithBack";
import FastImage from "@d11/react-native-fast-image";
import DeviceInfo from "react-native-device-info";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Colors } from "@/Constants";
import { PRIVACY_POLICY, PUBLIC_API } from "@Service/provider/endpoints";
import { useTranslation } from "react-i18next";

export default function AboutContainer() {
  const { t } = useTranslation();

  return (
    <View style={styles.main}>
      <StatusBar backgroundColor={"#B4E8FF"} />
      <HeaderWithBack customStyle={{ backgroundColor: "#B4E8FF" }} />
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <FastImage source={require("@Images/logo.png")} style={{ width: 200, height: 200 }} />
          <Text style={styles.appName}>ComOn</Text>
          <Text style={styles.appVersion}>{`${t("titles.version", { defaultValue: "Version" })} ${DeviceInfo.getVersion()} (${
            DeviceInfo.getBuildNumber() ?? "-"
          })`}</Text>
          <Text style={styles.appVersion}>
          {t("titles.server", { defaultValue: "Server" })}: {PUBLIC_API == "https://comon.peclick.com" ? "Development" : "Staging"}
        </Text>
        </View>
        <View style={{ marginHorizontal: 40, justifyContent: "flex-end", flexGrow: 1}}>
          <Pressable
            onPress={() => {
              Linking.openURL(PRIVACY_POLICY);
            }}
            style={{ flexDirection: "row", alignItems: "center", marginVertical: 5 }}
          >
            <Text style={{ fontSize: 14, color: "rgba(51, 51, 51, 1)" }}>{"FAQ"}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              Linking.openURL(PRIVACY_POLICY);
            }}
            style={{ flexDirection: "row", alignItems: "center", marginVertical: 5 }}
          >
            <Text style={{ fontSize: 14, color: "rgba(51, 51, 51, 1)" }}>{t("titles.contact-us")}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              Linking.openURL(PRIVACY_POLICY);
            }}
            style={{ flexDirection: "row", alignItems: "center", marginVertical: 5 }}
          >
            <Text style={{ fontSize: 14, color: "rgba(51, 51, 51, 1)" }}>{t("titles.privacy-policy")}</Text>
          </Pressable>

          <Text style={{ fontSize: 12, color: "#828282", marginTop: 30 }}>{"@ 2020 ComOn Inc."}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#B4E8FF",
  },
  container: {
    flexGrow: 1,
    paddingVertical:80
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    // height: "40%"
  },
  appName: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 25,
    color: "#333",
  },
  appVersion: {
    marginTop: 5,
  },
});
