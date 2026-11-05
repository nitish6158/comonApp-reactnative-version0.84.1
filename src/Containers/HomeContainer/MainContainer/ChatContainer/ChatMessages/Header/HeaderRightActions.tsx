import { IOngoingCall, groupCallActiveData } from "@Atoms/callActiveStatusAtom";
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
import { Keyboard, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import AntDesign from "react-native-vector-icons/AntDesign";
import AudioVideoContainer from "./AudioVideoContainer";
import Colors from "@/Constants/Colors";
import JoinContainer from "./JoinContainer";
import Settingtwo from "@Images/setting-two.svg";
import { navigate } from "@Navigation/utility";
import { singleRoom } from "@Atoms/singleRoom";
import { useTranslation } from "react-i18next";
import { socket } from "@/redux/Reducer/SocketSlice";
import { useAppSelector } from "@/redux/Store";
import { socketConnect } from "@/utils/socket/SocketConnection";

type props = {
  isCalling: boolean;
  isSetting: boolean;
};
export default function HeaderRightActions({ isCalling, isSetting }: props) {
  const groupActiveCallData = useAtomValue(groupCallActiveData);
  const [onGoingCallsData, setOnGoingCalls] = useState<IOngoingCall | null>(null);

  const display = useAtomValue(singleRoom);
  const { MyProfile } = useAppSelector((state) => state.Chat);

  const { t } = useTranslation();
  const [multiSelectionType, setMultiSelectionType] = useAtom(MultiSelectionTypeAtom);
  const [isMultiSelection, setMultiSelection] = useAtom(MultiSelectionAtom);
  const setDeleteState = useSetAtom(IsMessageDeleteSelectionVisibleAtom);
  const setforwardvisible = useSetAtom(IsMessageForwardSelectionVisibleAtom);
  const setSelectedOptionItem = useSetAtom(selectedMessageAtom);
  const setCidList = useSetAtom(selectedForwardMessagesListAtom);
  const setChatMessageIndex = useSetAtom(chatIndexForScroll);
  const [mode, setChatMode] = useAtom(chatMode);
  const setSearchenable = useSetAtom(chatSearchEnabledAtom);

  useEffect(() => {
    if (groupActiveCallData) {
      const isExist = groupActiveCallData.filter((gp) => gp.roomId == display.roomId);
      if (isExist.length > 0) {
        setOnGoingCalls(isExist[0]);
      } else {
        setOnGoingCalls(null);
      }
    }
  }, [groupActiveCallData, display]);

  if (isMultiSelection) {
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
        <View style={{ flexDirection: "row", alignItems: "center", marginRight: 10 }}>
          {MyProfile?.mode == "CLASSIC" && (
            <AntDesign
              name="search1"
              size={20}
              color="black"
              style={{ marginRight: 10 }}
              onPress={() => {
                setSearchenable(true);
                if (mode !== "search") setChatMode("search");
              }}
            />
          )}
          <Text>{t("btn.cancel")}</Text>
        </View>
      </Pressable>
    );
  } else {
    return (
      <View style={[styles.secondryContainer, { alignItems: "center", justifyContent: "flex-end" }]}>
        {isCalling && <CallContainer />}
        {isSetting && (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.buttonContainer}
            onPress={() => {
              Keyboard.dismiss();
              global.roomId = null;
              navigate("ChatProfileScreen", {});
              socketConnect.emit("getFavouriteChats", { roomId: display.roomId });
            }}
          >
            <Settingtwo />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  function CallContainer() {
    if (display?.roomType == "broadcast") {
      return <></>;
    }

    // In individual chats, left_at can be stale/non-zero after block/unblock flows.
    // Hide call actions by left_at only for non-individual rooms.
    if (display.roomType !== "individual" && display.currentUserUtility.left_at !== 0) {
      return <></>;
    }

    if (onGoingCallsData) {
      return <JoinContainer data={onGoingCallsData} />;
    } else {
      return <AudioVideoContainer />;
    }
  }
}

const styles = StyleSheet.create({
  Backarrow: { transform: [{ rotate: "180deg" }] },
  OnlineStyle: {
    backgroundColor: Colors.light.onlineGreen,
    borderColor: Colors.light.background,
    borderRadius: 50,
    borderWidth: 2.4,
    height: 14,
    left: 58,
    position: "absolute",
    top: 20,
    width: 14,
  },
  buttonContainer: {
    alignItems: "center",
    height: 35,
    justifyContent: "center",
    marginHorizontal: 3,
    width: 35,
    // backgroundColor: "red",
  },
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
  container: {
    flexDirection: "row",
    // justifyContent: "",
  },
  downArrow: { marginLeft: 20, marginRight: 10, transform: [{ rotate: "90deg" }] },
  secondryContainer: { flexDirection: "row", paddingLeft: 10 },
  upArrow: { transform: [{ rotate: "-90deg" }] },
});
