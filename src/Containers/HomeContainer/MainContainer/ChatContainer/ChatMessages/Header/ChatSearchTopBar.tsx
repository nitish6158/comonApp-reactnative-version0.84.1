import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { DoubleUserAction, Hidemessage, SingleUserAction } from "@Types/types";
import {
  IsMessageDeleteSelectionVisibleAtom,
  IsMessageForwardSelectionVisibleAtom,
  MultiSelectionAtom,
  MultiSelectionTypeAtom,
  chatMode,
  chatSearchEnabledAtom,
  chatSearchPaginationIndexAtom,
  chatSearchResultAtom,
  chatSearchTextMessage,
  selectedForwardMessagesListAtom,
  selectedMessageAtom,
} from "@Atoms/ChatMessageEvents";
import React, { useEffect, useMemo, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import AntDesign from "react-native-vector-icons/AntDesign";
import Colors from "@/Constants/Colors";
// import RealmContext from "../../../../../../schemas";
import { singleRoom } from "@Atoms/singleRoom";
import { useTranslation } from "react-i18next";
import { socketManager } from "@/utils/socket/SocketManager";

// const { useQuery, useRealm } = RealmContext;

let expireTimeout: NodeJS.Timeout | undefined = undefined;
const { width } = Dimensions.get("screen");

export default function ChatSearchTopBar() {

  const display = useAtomValue(singleRoom);

  const setDeleteState = useSetAtom(IsMessageDeleteSelectionVisibleAtom);
  const setforwardvisible = useSetAtom(IsMessageForwardSelectionVisibleAtom);
  const setSelectedOptionItem = useSetAtom(selectedMessageAtom);
  const setCidList = useSetAtom(selectedForwardMessagesListAtom);
  const setMultiSelectionType = useSetAtom(MultiSelectionTypeAtom);
  const setMultiSelection = useSetAtom(MultiSelectionAtom);
  const setSearchenable = useSetAtom(chatSearchEnabledAtom);
  const setSearchResult = useSetAtom(chatSearchResultAtom);
  const setsearchText = useSetAtom(chatSearchTextMessage);
  const setChatSearchPaginationIndex = useSetAtom(
    chatSearchPaginationIndexAtom
  );
  const [mode, setChatMode] = useAtom(chatMode);
  const { t } = useTranslation();

  const findMessage = (e: string) => {
    if (e.length >= 1) {
      setsearchText(e);
      clearTimeout(expireTimeout);
    } else {
      setsearchText("");
      setSelectedOptionItem(null);
    }
  };

  useEffect(() => {
    return () => {
      closeSearchBar()
    };
  }, []);

  const closeSearchBar = () => {
    setsearchText("");
    setSearchenable(false);
    if (mode !== "scroll") setChatMode("scroll");
    setforwardvisible(false);
    setDeleteState(false);
    setSelectedOptionItem(null);
    setCidList([]);
    setMultiSelection(false);
    setMultiSelectionType("");
    setSearchResult(() => chatSearchResultAtom.init);
  };

  return (
    <View style={styles.chatsearchheader}>
      <Pressable onPress={closeSearchBar} style={{ marginLeft: 5 }}>
        <AntDesign name="left" size={23} />
      </Pressable>

      <TextInput
        autoFocus={true}
        autoCorrect={true}
        style={{ width: width / 1.4, height: 29, marginLeft: 15 }}
        placeholder={t("chat-screen.search-messages")}
        onChangeText={(e) => {
          findMessage(e);
        }}
      />
      <Pressable onPress={closeSearchBar}>
        <Text>{t("btn.cancel")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  chatsearchheader: {
    alignItems: "center",
    backgroundColor: Colors.light.LightBlue,
    elevation: 1,
    flexDirection: "row",
    height: 60,
    shadowColor: Colors.light.formItemBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
});
