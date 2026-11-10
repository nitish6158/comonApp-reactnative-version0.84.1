import {
  IsMessageDeleteSelectionVisibleAtom,
  IsMessageForwardSelectionVisibleAtom,
  MultiSelectionAtom,
  MultiSelectionTypeAtom,
  chatIndexForScroll,
  chatMode,
  chatSearchEnabledAtom,
  selectedForwardMessagesListAtom,
  selectedMessageAtom,
} from "@Atoms/ChatMessageEvents";
import { Pressable, Text, View } from "react-native";
import { useAtom, useSetAtom } from "jotai";

import React from "react";
import { useTranslation } from "react-i18next";

import { VectorIconCompat } from "@/Components/icons";

export default function MultiSelectionHeader() {
  const { t } = useTranslation();
  const setMultiSelectionType = useSetAtom(MultiSelectionTypeAtom);
  const setMultiSelection = useSetAtom(MultiSelectionAtom);
  const setDeleteState = useSetAtom(IsMessageDeleteSelectionVisibleAtom);
  const setforwardvisible = useSetAtom(IsMessageForwardSelectionVisibleAtom);
  const setSelectedOptionItem = useSetAtom(selectedMessageAtom);
  const setCidList = useSetAtom(selectedForwardMessagesListAtom);
  const setChatMessageIndex = useSetAtom(chatIndexForScroll);
  const [mode, setChatMode] = useAtom(chatMode);
  const setSearchenable = useSetAtom(chatSearchEnabledAtom);
  return (
    <Pressable
      onPress={() => {
        setforwardvisible(false);
        setDeleteState(false);
        setSelectedOptionItem(null);
        setChatMessageIndex(null);
        setCidList([]);
        setMultiSelection(false);
        setMultiSelectionType("");
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <VectorIconCompat
          name="search1"
          size={20}
          color="black"
          style={{ marginRight: 10 }}
          onPress={() => {
            setSearchenable(true);
            if (mode !== "search") setChatMode("search");
          }}
        />
        <Text>{t("btn.cancel")}</Text>
      </View>
    </Pressable>
  );
}
