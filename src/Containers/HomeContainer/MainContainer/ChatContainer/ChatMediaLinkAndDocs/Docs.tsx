/* eslint-disable react-native/no-color-literals */
import {
  Dimensions,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import React, { useState } from "react";
import {
  RoomDocsAtom,
  chatIndexForScroll,
  chatMode,
} from "@Atoms/ChatMessageEvents";

import ArrowRight from "@Images/Arrow_right.svg";
import AudioModal from "../ChatMessages/SendMoreOptionsModal/AudioModal";
import Colors from "@/Constants/Colors";
import FileViewer from "react-native-file-viewer";
import GetExtension from "@Util/getExtensionfromUrl";
import { Hidemessage } from "@Types/types";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
// import RealmContext from "../../../../../schemas";
import { RootState } from "@Store/Reducer";
import SectionTitle from "./SectionTitle";
import { SimpleGrid } from "react-native-super-grid";
import ToastMessage from "@Util/ToastMesage";
import getDownloadfileName from "@Util/GetDownlodedFilename";
import { navigate } from "@Navigation/utility";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import useFileSystem from "@Hooks/useFileSystem";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { socketManager } from "@/utils/socket/SocketManager";
import { DefaultImageUrl } from "@/graphql/provider/endpoints";

// const { useQuery } = RealmContext;
const { width } = Dimensions.get("screen");

function Docs({ name }: { name: string }) {
  const data = useAtomValue(RoomDocsAtom);

  const [chatMessageIndex, setChatMessageIndex] = useAtom(chatIndexForScroll);
  const setChatMode = useSetAtom(chatMode);

  const { getFileLocationByFilename } = useFileSystem();
  const getDocName = (url: string) => {
    const tempData = url.split("/");
    return tempData[2];
  };

  const [display] = useAtom(singleRoom);
  const DownloadFileStore = useSelector((state: RootState) => state.Chat.DownloadFileStore);

  // const query = useQuery("conversations");

  const { MyProfile } = useSelector((state: RootState) => state.Chat);

  const { t } = useTranslation();

  async function onPressOpenDocument(item: any) {
    try {
      const fileName = getDownloadfileName(item?.fileURL);
      const isDownloaded = DownloadFileStore?.indexOf(fileName) !== -1;

      if (isDownloaded) {
        await FileViewer.open(getFileLocationByFilename(item?.fileURL), {
          showOpenWithDialog: true,
        });
        return;
      }

      await Linking.openURL(`${DefaultImageUrl}${item?.fileURL}`);
    } catch (error) {
      ToastMessage(`${t("toastmessage.install-message")} ${GetExtension(item?.fileURL)}`);
    }
  }

  async function onPressViewMessage(item: any) {
    // const result = query.filtered("roomId == $0 ", display.roomId).sorted("created_at");
    const result = []
    const filtedData = result.filter(
      (chat: any) =>
        chat?.deleted?.findIndex(
          (item: any) =>
            item.type == Hidemessage[item.type] &&
            item.user_id == MyProfile?._id
        ) === -1 &&
        (display.currentUserUtility?.left_at == 0 ||
          chat.created_at < display.currentUserUtility?.left_at)
    );
    const conversationIndex = filtedData
      .reverse()
      .findIndex((e) => e?._id == item._id.toString());
    if (conversationIndex != -1) {
      console.log("------->", conversationIndex);
      setChatMode("search");
      navigate("ChatMessageScreen", {
        RoomId: display.roomId,
      });

      setTimeout(() => {
        setChatMessageIndex(conversationIndex == 0 ? 1 : conversationIndex);
      }, 2000);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 20,
      }}
    >
      {data.length === 0 && (
        <View style={{ flex: 1, alignItems: "center", marginTop: 135 }}>
          <Text style={{ color: "#333333", fontSize: 18, marginBottom: 16 }}>
            {t("education-business.docs")}
          </Text>
          <Text style={{ color: "#828282", fontSize: 14, textAlign: "center" }}>
            {t("education-business.docs-description")} {name ?? "N/A"}{" "}
            {t("education-business.end-description")}
          </Text>
        </View>
      )}
      <ScrollView showsVerticalScrollIndicator={false}>
        {data.map((element: any, elementIndex: any) => (
          <View
            key={element.title}
            style={{ marginTop: elementIndex === 0 ? 0 : 20 }}
          >
            <SectionTitle title={element.title} />
            <SimpleGrid
              style={{ flex: 1 }}
              itemDimension={width - 40}
              data={element.data}
              renderItem={({ item, index }) => {
                return (
                  <View key={index} style={{ paddingHorizontal: 10 }}>
                    <View>
                      <Pressable
                        onPress={() => {
                          onPressOpenDocument(item);
                        }}
                        style={{
                          width: "100%",
                          marginBottom: 10,
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <View
                          // eslint-disable-next-line react-native/no-inline-styles
                          style={{
                            backgroundColor: "#F3F9FC",
                            width: 30,
                            height: 30,
                            borderRadius: 30,
                            justifyContent: "center",
                            alignItems: "center",
                            marginRight: 16,
                          }}
                        >
                          <MaterialCommunityIcons
                            name="file-document-outline"
                            size={22}
                            color={Colors.light.PrimaryColor}
                          />
                        </View>
                        <View style={{ flexShrink: 1 }}>
                          <Text
                            style={{
                              color: "#333333",
                              fontSize: 15,
                              fontFamily: "Lato",
                            }}
                          >
                            {getDocName(item.fileURL)}
                          </Text>
                        </View>
                      </Pressable>
                      <Pressable
                        style={{
                          width: "100%",
                          marginBottom: 15,
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                        onPress={() => onPressViewMessage(item)}
                      >
                        <Text
                          style={{
                            color: "#333333",
                            fontSize: 12,
                            fontFamily: "Lato",
                          }}
                        >
                          View Messages
                        </Text>
                        <ArrowRight />
                      </Pressable>
                    </View>
                  </View>
                );
              }}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export default Docs;
