import * as React from "react";

import { Pressable, StyleSheet, View } from "react-native";

import { CurrentOrganization } from "./CurrentOrganization";
import { DrawerHeaderProps } from "@react-navigation/drawer";
import Icon from "@Images/Icon";
import { LogoTitle } from "../logo";
import MainSearch from "@Images/MainSearch.svg";
import { headerStyle } from "./HeaderStyle";
import { layoutStyle } from "../layout/LayoutStyle";
import { mainStyles } from "../../styles/main";
import { navigate } from "@Navigation/utility";

export const CallHeader = (props: DrawerHeaderProps) => {
  const onNavigateToCall = () => {
    navigate("CallParticipantSelectionScreen", {});
  };
  const onNavigateToContacts = () => {
    navigate("ContactListScreen", { ShareContact: false });
  };
  return (
    <View style={headerStyle.header}>
      <Pressable
        onPress={() => {
          navigate("UserProfileScreen", {});
        }}
      >
        <LogoTitle />
        {/* <CurrentOrganization /> */}
      </Pressable>
      <View style={{ flexDirection: "row", alignItems: "center", height: "100%" }}>
        <Pressable style={styles.buttonContainer} onPress={onNavigateToCall}>
          <Icon.PhoneAdd />
        </Pressable>
        <Pressable style={styles.buttonContainer} onPress={onNavigateToContacts}>
          <MainSearch />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: "center",
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
});
