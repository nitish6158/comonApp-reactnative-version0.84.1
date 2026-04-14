import * as React from "react";

import { DrawerActions, useNavigation } from "@react-navigation/core";
import { Pressable, StyleSheet, View } from "react-native";

import { CurrentOrganization } from "./CurrentOrganization";
import Folder from "@Images/Folder.svg";
import { LogoTitle } from "../logo";
import MainSearch from "@Images/MainSearch.svg";
import { headerStyle } from "./HeaderStyle";
import { layoutStyle } from "../layout/LayoutStyle";
import { mainStyles } from "../../styles/main";
import { navigate } from "@Navigation/utility";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

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
          <Feather name="database" color="black" size={18} />
        </Pressable>
        <Pressable
          style={styles.buttonContainer}
          onPress={() => {
            navigation.navigate("ViewTopicsScreen", {});
          }}
        >
          <Feather name="target" size={20} color="black" />
        </Pressable>
        <Pressable style={styles.buttonContainer} onPress={onNavigateToFolder}>
          <MaterialCommunityIcons name="folder-text-outline" size={24} color="black" />
        </Pressable>
        <Pressable style={styles.buttonContainer} onPress={onNavigateToGlobalSearch}>
          <MainSearch />
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
