import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { ScreenWidth } from "react-native-elements/dist/helpers";
import { FlatList } from "react-native-gesture-handler";

export type tabType = "All" | "Comon" | "Other";

type props = {
  currectTab: tabType;
  tabList: Array<tabType>;
  onTabPressed: (tabType: tabType) => void;
};

export default function ContactTabView({ currectTab, tabList, onTabPressed }: props) {
  const TabList = useMemo(() => {
    return tabList.map((item, index) => {
      return (
        <Pressable
          onPress={() => onTabPressed(item)}
          style={[styles.tabContainer, currectTab == item ? styles.active_tab : styles.inActive_tab]}
          key={index}
        >
          <Text>{item}</Text>
        </Pressable>
      );
    });
  }, [tabList, currectTab]);

  return (
    <View style={styles.main}>
      <FlatList horizontal={true} data={TabList} renderItem={(Tab) => Tab.item} />
    </View>
  );
}

const styles = StyleSheet.create({
  main: {},
  tabContainer: {
    flex: 1,
    width: ScreenWidth / 3,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },
  active_tab: {
    backgroundColor: "#F3F9FC",
    borderBottomColor: "#33CCFF",
    borderBottomWidth: 1,
  },
  inActive_tab: {
    backgroundColor: "white",
    borderBottomColor: "#E0E0E0",
    borderBottomWidth: 1,
  },
});
