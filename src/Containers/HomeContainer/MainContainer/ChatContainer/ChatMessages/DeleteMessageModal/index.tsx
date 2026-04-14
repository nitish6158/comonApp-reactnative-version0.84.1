import {
  IsMessageDeleteSelectionVisibleAtom,
  MultiSelectionAtom,
  chatMode,
  chatSearchEnabledAtom,
  chatSearchPaginationIndexAtom,
  chatSearchResultAtom,
  chatSearchTextMessage,
  selectedForwardMessagesListAtom,
  selectedMessageAtom,
} from "@Atoms/ChatMessageEvents";
import React, { useContext, useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { Conversation } from "@Models/chatmessage";
import CustomModal from "@Components/Comon";
import dayjs from "dayjs";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { socket } from "@/redux/Reducer/SocketSlice";
import { socketManager } from "@/utils/socket/SocketManager";
import { socketConnect } from "@/utils/socket/SocketConnection";
import { ChatContext } from "@/Context/ChatProvider";

interface DeleteForwardModalProps { }
export default function DeleteForwardModal({ }: DeleteForwardModalProps) {
  const [display] = useAtom(singleRoom);

  const [visible, setVisible] = useAtom(IsMessageDeleteSelectionVisibleAtom);
  const [selectedItem, setselectedItem] = useAtom(selectedMessageAtom);
  const [Cidlist, setCidList] = useAtom(selectedForwardMessagesListAtom);
  const [, setSearchResult] = useAtom(chatSearchResultAtom);
  const [, setSearchenable] = useAtom(chatSearchEnabledAtom);
  const [isMultiSelection, setMultiSelection] = useAtom(MultiSelectionAtom);
  const [searchText, setsearchText] = useAtom(chatSearchTextMessage);
  const [mode, setChatMode] = useAtom(chatMode);
  const { updateMessage } = useContext(ChatContext);

  const { t } = useTranslation();

  const handleDeleteForMe = () => {
    const list = Cidlist.map((c) => c._id);

    // list.forEach((e) => {
    //   const payload = {
    //     type: "me",
    //     cause: "deleted",
    //     roomId: display.roomId,
    //     messageId: e,
    //   };
    // socketManager.conversation.deleteChat(payload);
    // });

    // const serverList = Cidlist.map((c) => c.server_id);

    socketConnect.emit("deleteChat", {
      cid: list,
      roomId: display.roomId,
      type: "me",
    });

    updateMessage(list, {
      type: "delete",
      data: {
        type: "me",
        cause: "deleted",
      },
    });

    socketConnect.emit("removeChatsFromFavourite", { cid: list });

    setselectedItem(null);
    setCidList([]);
    setSearchenable(false);

    if (mode !== "scroll") setChatMode("scroll");
    setSearchResult([]);
    setMultiSelection(false);
    setVisible(false);
    setsearchText("");
    // onDelete();
  };

  const handleDeleteForEveryone = () => {
    const list = Cidlist.map((c) => c._id);

    // list.forEach((e) => {
    //   const payload = {
    //     type: "everyone",
    //     cause: "deleted",
    //     roomId: display.roomId,
    //     messageId: e,
    //   };
    //   socketManager.conversation.deleteChat(payload);
    // });

    const serverList = Cidlist.map((c) => c.server_id);

    socketConnect.emit("deleteChat", {
      cid: list,
      roomId: display.roomId,
      type: "everyone",
    });
    updateMessage(list, {
      type: "delete",
      data: {
        type: "everyone",
        cause: "deleted",
      },
    });
    socketConnect.emit("removeChatsFromFavourite", { cid: list });

    setselectedItem(null);
    setCidList([]);
    setSearchenable(false);
    if (mode !== "scroll") setChatMode("scroll");
    setSearchResult([]);
    setMultiSelection(false);
    setVisible(false);
  };

  const CustomButtons = useMemo(() => {
    return getDeleteOptionsForSelectedMessages(
      Cidlist,
      display.currentUserUtility.user_id
    );
  }, [Cidlist, display.currentUserUtility]);

  return (
    <View>
      <CustomModal
        modalVisible={visible}
        setModalVisible={setVisible}
        customButtons={CustomButtons}
      />
    </View>
  );

  function getDeleteOptionsForSelectedMessages(
    Cidlist: Conversation[],
    currentUserID: string
  ) {
    const commonDeleteOption = {
      title: `${t("delete-chat.delete-for-me")}`,
      onPress: handleDeleteForMe,
      buttonColor: "#FF7D7D",
    };

    const canWeDeleteMessagesForEveryone = Cidlist?.every((item) => {
      const pastTime = dayjs().valueOf() - dayjs(item?.created_at).valueOf();
      return pastTime <= 600000;
    });

    const isSelectedMessageContainOtherMembersMessage = Cidlist?.some(
      (item) => item.sender !== currentUserID
    );

    if (isSelectedMessageContainOtherMembersMessage) {
      return [commonDeleteOption];
    }

    if (!isSelectedMessageContainOtherMembersMessage) {
      if (canWeDeleteMessagesForEveryone) {
        return [
          commonDeleteOption,
          {
            title: `${t("delete-chat.delete-for-everyOne")}`,
            onPress: handleDeleteForEveryone,
            buttonColor: "#FF7D7D",
          },
        ];
      }
    }

    return [commonDeleteOption];
  }
}
