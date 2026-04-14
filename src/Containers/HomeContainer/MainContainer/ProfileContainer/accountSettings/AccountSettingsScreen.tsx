import { Pressable, StyleSheet, Text } from "react-native";
import React, { useEffect, useState } from "react";

import { View } from "react-native";

import { navigate } from "@/navigation/utility";
import FastImage from "@d11/react-native-fast-image";
import { useAtomValue } from "jotai";
import { currentUserIdAtom } from "@/Atoms";
import { DefaultImageUrl } from "@Service/provider/endpoints";
import { HeaderWithScreenName } from "@Components/header/HeaderWithScreenName";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Colors, fonts } from "@/Constants";
import AntDesign from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { ProfileScreenProps } from "@/navigation/screenPropsTypes";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useAppSelector } from "@/redux/Store";

export default function AccountSettingsScreen({ navigation }: ProfileScreenProps) {
  const {MyProfile} = useAppSelector(state=> state.Chat)
  const { t } = useTranslation();

  const onNavigateToProfileSetting = () => {
    navigate("EditProfileImageScreen", {});
    // navigation.dispatch(DrawerActions.closeDrawer());
  };

  return (
    <View style={styles.main}>
      <HeaderWithScreenName title={t("navigation.settings")} />
      <Pressable
        onPress={onNavigateToProfileSetting}
        style={{
          marginHorizontal: 20,
          paddingVertical: 20,
          flexDirection: "row",
          alignItems: "center",
          borderBottomColor: "rgba(51,51,51,.2)",
          borderBottomWidth: 1,
        }}
      >
        <FastImage
          source={{ uri: `${DefaultImageUrl}${MyProfile?.profile_img}` }}
          style={{ height: 56, width: 56, borderRadius: 40 }}
        />
        <View style={{ marginLeft: 16 }}>
          <Text style={{ fontSize: 18 }}>{`${MyProfile?.firstName} ${MyProfile?.lastName}`}</Text>
          <Text style={{ fontSize: 13, color: "gray",marginRight:50 }}>{MyProfile?.bio?.status}</Text>
        </View>
      </Pressable>
      <View style={{ marginLeft: 20, marginTop: 20 }}>
        <Pressable style={styles.settingContainer} onPress={() => navigate("UserPrivacySettings", {})}>
          <View style={{ marginRight: 20 }}>
            <MaterialIcons name="lock-outline" size={24} color={"gray"} />
          </View>
          <View>
            <Text style={styles.settingTitle}>{t("privacy")}</Text>
            <Text style={styles.settingDescription}>{`${t("navigation.BlockedContacts")}, ${t("readReceipts")}`}</Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => {
            navigate("PasswordChangeContainer", {});
          }}
          style={styles.settingContainer}
        >
          <View style={{ marginRight: 20 }}>
            <Ionicons name="key-outline" size={22} color="gray" />
          </View>
          <Text style={styles.settingTitle}>{t("titles.change-password")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "white",
  },
  rowDirection: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  settingTitle: {
    fontFamily: fonts.Lato,
    fontSize: 16,
  },
  settingDescription: {
    color: "gray",
    fontSize: 13,
  },
});
