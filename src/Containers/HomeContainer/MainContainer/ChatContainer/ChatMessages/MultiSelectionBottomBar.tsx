import {
  IsMessageDeleteSelectionVisibleAtom,
  IsMessageForwardSelectionVisibleAtom,
  MultiSelectionAtom,
  MultiSelectionTypeAtom,
  chatSearchEnabledAtom,
  chatSearchResultAtom,
  chatSearchTextMessage,
  selectedForwardMessagesListAtom,
  selectedMessageAtom,
} from "@Atoms/ChatMessageEvents";
import { Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import React, { useCallback, useState } from "react";

import Colors from "@/Constants/Colors";
import DeleteWithRedBackground from "@Images/DeleteWithRedBackground.svg";
import Forward from "@Images/ForwardWhite.svg";
import Text from "@Components/Text";
import { useAtom } from "jotai";
import { useNavigation } from "@react-navigation/core";
import { useTranslation } from "react-i18next";

export default function MultiSelectionBottomBar() {
  const [multiSelectionType, setMultiSelectionType] = useAtom(MultiSelectionTypeAtom);
  const [Cidlist, setCidList] = useAtom(selectedForwardMessagesListAtom);
  const [, setselectedItem] = useAtom(selectedMessageAtom);
  const [, setDelete] = useAtom(IsMessageDeleteSelectionVisibleAtom);
  const [, setSetForwardVisible] = useAtom(IsMessageForwardSelectionVisibleAtom);
  const [isMultiSelection, setMultiSelection] = useAtom(MultiSelectionAtom);
  const [, setSearchenable] = useAtom(chatSearchEnabledAtom);
  const [, setSearchResult] = useAtom(chatSearchResultAtom);
  const [searchText, setsearchText] = useAtom(chatSearchTextMessage);
  const navigation = useNavigation();
  const { t } = useTranslation();

  const onActionPress = () => {
    if (multiSelectionType == "FORWARD") {
      setSetForwardVisible(false);
      console.log("Cidlist", Cidlist.length);
      navigation.navigate("ForwardMessageScreen", { Cidlist: Cidlist });

      setselectedItem(null);
      setMultiSelectionType("");
      setMultiSelection(false);
      setSearchenable(false);
      setSearchResult([]);
      setCidList([]);
      setsearchText("");
    }
    if (multiSelectionType == "DELETE") {
      setDelete(true);
    }
  };

  const ForwardButton = useCallback(() => {
    return (
      <Pressable style={styles.iconcontainer} onPress={onActionPress}>
        <Forward />
      </Pressable>
    );
  }, [Cidlist]);

  const DeleteButton = useCallback(() => {
    return (
      <Pressable style={styles.iconcontainer} onPress={onActionPress}>
        <DeleteWithRedBackground />
      </Pressable>
    );
  }, [Cidlist]);

  const RenderActionButton = useCallback(() => {
    switch (multiSelectionType) {
      case "FORWARD":
        return <ForwardButton />;
      case "DELETE":
        return <DeleteButton />;
      default:
        return <View></View>;
    }
  }, [multiSelectionType, Cidlist]);

  return (
    <View style={styles.container}>
      <Text>
        {Cidlist?.length} {t("others.Selected")}
      </Text>
      <RenderActionButton />
    </View>
  );
}

// define your styles
const styles = StyleSheet.create({
  RightIconContainer: {
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    right: 16,
    width: 70,
    zIndex: 999,
  },
  TextInputStyle: {
    backgroundColor: Colors.light.LightBlue,
    borderRadius: 6,
    flex: 1,
    marginLeft: 10,
    paddingLeft: 10,
    paddingRight: 100,
    paddingTop: Platform.OS == "ios" ? 15 : 0,
  },
  container: {
    alignItems: "center",
    backgroundColor: Colors.light.LightBlue,
    bottom: 0,
    flexDirection: "row",
    height: 60,
    justifyContent: "space-between",
    left: 0,
    paddingHorizontal: 30,
    // position: "absolute",
    right: 0,
    width: "100%",
    zIndex: 999,
  },
  iconcontainer: {
    alignItems: "center",
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 50,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
});
