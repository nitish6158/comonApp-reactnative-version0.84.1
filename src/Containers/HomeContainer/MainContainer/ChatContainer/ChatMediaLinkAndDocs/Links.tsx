import {
  Dimensions,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { chatIndexForScroll, chatMode, RoomLinksAtom } from "@Atoms/ChatMessageEvents";

import ArrowRight from "@Images/Arrow_right.svg";
import Autolink from "react-native-autolink";
import Colors from "@/Constants/Colors";
import Feather from "react-native-vector-icons/Feather";
// import RealmContext from "../../../../../schemas";
import { RootState } from "@Store/Reducer";
import SectionTitle from "./SectionTitle";
import { SimpleGrid } from "react-native-super-grid";
import ToastMessage from "@Util/ToastMesage";
import dayjs from "dayjs";
import { navigate } from "@Navigation/utility";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { socketManager } from "@/utils/socket/SocketManager";
import useFindActiveRoomLinks from "@/utils/findConversitionLinks";

const { width } = Dimensions.get("window");


function Links({ name }: { name: string }) {
  const MyProfile = useSelector((state: RootState) => state.Chat.MyProfile);
  const { t } = useTranslation();

  const [display] = useAtom(singleRoom);
  const [chatMessageIndex, setChatMessageIndex] = useAtom(chatIndexForScroll);
  const setChatMode = useSetAtom(chatMode);
  const linksSections = useAtomValue(RoomLinksAtom)

  const onLinkPress = async (item: any) => {
    const result = []

    // console.log("result: =====>", result);
    const data = result.map((i) => i._id);

    const conversationMessageIndex = data.findIndex((c) => c == item._id);

    if (conversationMessageIndex != -1) {
      setChatMode("search");
      setChatMessageIndex(conversationMessageIndex);
      navigate("ChatMessageScreen", {
        RoomId: display.roomId,
      });
    } else {
      ToastMessage(t("label.link-message-not-found"));
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 20,
      }}
    >
      {linksSections.length === 0 && (
        <View style={{ flex: 1, alignItems: "center", marginTop: 135 }}>
          <Text style={{ color: "#333333", fontSize: 18, marginBottom: 16 }}>
            {t("education-business.links")}
          </Text>
          <Text style={{ color: "#828282", fontSize: 14, textAlign: "center" }}>
            {t("education-business.links-description")} {name ?? "N/A"}{" "}
            {t("education-business.end-description")}
          </Text>
        </View>
      )}
      <ScrollView showsVerticalScrollIndicator={false}>
        {linksSections.map((element, elementIndex: any) => (
          <View
            key={elementIndex}
            style={{ marginTop: elementIndex === 0 ? 0 : 20 }}
          >
            <SectionTitle title={element.title} />
            <View style={{ flexDirection: "row" }}>
              <SimpleGrid
                style={{ flex: 1 }}
                itemDimension={width - 20}
                data={element.data}
                renderItem={({ item, index }) => {
                  return (
                    <View style={{ paddingHorizontal: 10 }} key={index}>
                      <View
                        style={{
                          // width: "100%",
                          marginBottom: 5,
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
                          <Feather
                            name="link-2"
                            size={20}
                            color={Colors.light.PrimaryColor} />
                        </View>
                        <View style={{ flexShrink: 1 }}>

                          <Autolink
                            text={item.links.reduce((acc, curr) => acc + acc.length > 0 ? ", " : "" + curr, "")}
                            url={true}
                            showAlert={true} />
                        </View>
                      </View>
                      {/* <Pressable
                        onPress={() => onLinkPress(item)}
                        style={{
                          // width: "100%",
                          marginBottom: 15,
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "#333333",
                            fontSize: 12,
                            fontFamily: "Lato",
                            marginRight: 10,
                          }}
                        >
                          {t("education-business.view-messages")}
                        </Text>
                        <ArrowRight />
                      </Pressable> */}
                    </View>
                  );
                }} listKey={elementIndex} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export default Links;

function extractLinks(text: string) {
  // Regular expression to match URLs starting with http or https
  const urlRegex = /(https?|ftp):\/\/[^\s/$.?#].[^\s]*[^\s.?#]/gi;

  // Use match() to find all the URLs in the text
  const matches = text.match(urlRegex);

  // Return the list of URLs
  return matches || [];
}

const extractLinksFromData = (data) => {
  return data.map((item) => {
    const links = extractLinks(item.message);
    const formattedLinks = links.join(", ");
    return {
      _id: item._id,
      link: formattedLinks,
    };
  });
};

const addSectionIfLinksExist = (Links, title, data) => {
  const mergedArray = extractLinksFromData(data);

  // Check if a section with the same title already exists
  const existingSectionIndex = Links.findIndex(
    (section) => section.title === title
  );

  if (mergedArray.length > 0) {
    if (existingSectionIndex !== -1) {
      // If a section with the same title exists, add the data to that section
      Links[existingSectionIndex].data =
        Links[existingSectionIndex].data.concat(mergedArray);
    } else {
      // Otherwise, create a new section
      Links.push({
        title,
        data: mergedArray.reverse(),
      });
    }
  }
};
