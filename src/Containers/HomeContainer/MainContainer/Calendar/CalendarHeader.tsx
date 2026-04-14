import { Colors, fonts } from "@/Constants";
import { useNavigation } from "@react-navigation/core";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { Divider, ListItem } from "react-native-elements";
import Ionicons from "react-native-vector-icons/Ionicons";
import { CalendarModes } from "./CalendarResources";
import { useAtom, useSetAtom } from "jotai";
import { CalendarLoader, CalendarMode } from "@/Atoms/CalendarAtom";
import { Menu } from "react-native-material-menu";
import { navigate } from "@/navigation/utility";
import AddEventButton from "./components/AddEventButton";
import EventNotificationButton from "./components/EventNotificationButton";
import CalendarDataManipulator from "./CalendarDataManipulator";
import CalendarLocale from "./CalendarLocale";
import { LogoTitle } from "@Components/logo";
import { CurrentOrganization } from "@/Components/header";

export default function CalendarHeader() {
  const [expandList, setExpandList] = useState(false);
  const [selectedMode, setSelectedMode] = useAtom(CalendarMode);
  const setCalendarLoader = useSetAtom(CalendarLoader);
  const { t } = useTranslation();
  return (
    <>
      <View style={styles.container}>
        <View style={[styles.rowDirection, { justifyContent: "space-between" }]}>
          <View style={styles.rowDirection}>
            <Pressable
              onPress={() => {
                navigate("UserProfileScreen", {});
              }}
            >
              <LogoTitle />
              {/* <CurrentOrganization /> */}
            </Pressable>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <CalendarLocale />
            <CalendarDataManipulator />
            <EventNotificationButton />
            <AddEventButton />
            <Menu
              visible={expandList}
              anchor={
                <Pressable onPress={() => setExpandList(!expandList)}>
                  <Ionicons name="reorder-three-outline" size={30} />
                </Pressable>
              }
              onRequestClose={() => setExpandList(!expandList)}
              style={{
                width: "40%",
                marginTop: 30,
                shadowColor: "#171717",
                shadowOffset: { width: -2, height: 4 },
                shadowOpacity: 0.5,
                shadowRadius: 3,
              }}
            >
              {CalendarModes(t).map((e) => {
                return (
                  <ListItem
                    key={e.id}
                    containerStyle={[styles.rowDirection, { justifyContent: "space-between" }]}
                    onPress={() => {
                      setCalendarLoader(true);
                      setSelectedMode(e.id);
                      setExpandList(!expandList);
                    }}
                  >
                    <ListItem.Title>{e.label}</ListItem.Title>
                    {selectedMode == e.id && <ListItem.CheckBox checked checkedColor={Colors.light.PrimaryColor} />}
                  </ListItem>
                );
              })}
            </Menu>
          </View>
        </View>
      </View>
      <Divider />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: Colors.light.White,
  },
  rowDirection: {
    flexDirection: "row",
    alignItems: "center",
  },
  textTypo: {
    fontFamily: fonts.Lato,
    fontStyle: "normal",
  },
  headingTextStyle: {
    fontSize: 17,
    lineHeight: 19,
    color: Colors.light.black,
    marginLeft: 10,
  },
});
