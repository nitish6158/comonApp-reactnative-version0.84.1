import React from "react";
import { FolderAndTabsAtom } from "@/Atoms";
import { useAppSelector } from "@/redux/Store";
import { useNavigation } from "@react-navigation/core";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import { Colors } from "@/Constants";

export default function EmptyRoomList() {
  const { t } = useTranslation();
  const currentTab = useAtomValue(FolderAndTabsAtom);
  const MyProfile = useAppSelector((state) => state.Chat.MyProfile);
  const navigation = useNavigation();

  if (currentTab == 0) {
    return <></>;
  }

  return (
    <View style={styles.emptyMain}>
      <TouchableOpacity
        onPress={() => {
          let item = MyProfile.folders.find((v, i) => i + 1 == currentTab);
          if (item) {
            navigation.navigate("CreateFolderScreen", { FolderNameParams: item.name, isEdit: true, FolderItem: item });
          }
        }}
        style={styles.addbutton}
      >
        <AntDesign name="plus" size={24} color={"white"} />
      </TouchableOpacity>
      <Text style={styles.heading}>{t("folder-management.empty-folder")}</Text>
      <Text style={styles.subheading}>{t("folder-management.empty-folder-des")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyMain: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 580,
  },
  heading: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  subheading: {
    fontSize: 13,
    textAlign: "center",
    color: "gray",
    maxWidth:300,
    alignSelf:'center'
  },
  addbutton: {
    backgroundColor: Colors.light.PrimaryColor,
    alignSelf: "center",
    height: 45,
    width: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
});
