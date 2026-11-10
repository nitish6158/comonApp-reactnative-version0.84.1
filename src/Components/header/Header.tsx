// @ts-nocheck
import * as React from "react";

import { DrawerActions, useNavigation } from "@react-navigation/core";
import { Pressable, StyleSheet, View } from "react-native";

import { CurrentOrganization } from "./CurrentOrganization";
import { LogoTitle } from "../logo";
import { headerStyle } from "./HeaderStyle";
import { layoutStyle } from "../layout/LayoutStyle";
import { mainStyles } from "../../styles/main";
import { navigate } from "@Navigation/utility";

import { useTranslation } from "react-i18next";

import { AppIcon } from "@/Components/icons";

export default function Header() {
  const navigation = useNavigation();
  const {t} = useTranslation()
  const onNavigateToFolder = () => {
    navigate("FolderListScreen", {});
  };
  const onNavigateToGlobalSearch = () => {
    navigate("ChatGlobalSearchScreen", {});
  };
  const onNavigateToDatabase = () => {
    navigate("ViewDatabaseScreen", { parentId: null, title: t("userDatabase.title") });
  };
  return (
    <View style={[headerStyle.header, mainStyles.row, layoutStyle.containerBackground]}>
      <Pressable onPress={() => navigation.navigate("UserProfileScreen", {})}>
        <LogoTitle />
      </Pressable>
      {/* <CurrentOrganization /> */}
      <View style={{ flexDirection: "row", height: "100%", alignItems: "center" }}>
        <Pressable style={styles.buttonContainer} onPress={onNavigateToDatabase}>
          <AppIcon name="database" color="black" size={18} />
        </Pressable>
        <Pressable
          style={styles.buttonContainer}
          onPress={() => {
            navigation.navigate("ViewTopicsScreen", {});
          }}
        >
          <AppIcon name="target" size={20} color="black" />
        </Pressable>
        <Pressable style={styles.buttonContainer} onPress={onNavigateToFolder}>
          <AppIcon name="folder" size={24} color="black" />
        </Pressable>
        <Pressable style={styles.buttonContainer} onPress={onNavigateToGlobalSearch}>
          <AppIcon name="search" size={22} color="black" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: "center",
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
});
