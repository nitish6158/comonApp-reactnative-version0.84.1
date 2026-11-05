import ChatContactView from "@Components/ChatContactView";
import { DefaultImageUrl } from "@Service/provider/endpoints";
import FastImage from "@d11/react-native-fast-image";
import FormatTextRender from "@Components/formatTextRender";
import React, { useMemo } from "react";
import { RootState } from "@Store/Reducer";
import Text from "@Components/Text";
import { View } from "react-native";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom } from "jotai";
import { useSelector } from "react-redux";
import { getFileName } from "./FilePathUtility";
import DocumentPreview from "@Components/DocumentPreview";

import TextMessageComponent from "@/Containers/HomeContainer/MainContainer/ChatContainer/ChatMessages/MessageComponents/TextMessageComponent";

function getFileExtension(filePath: string) {
  try {
    const fileName = filePath.split("/").pop();
    const extension = fileName.split(".").pop();
    return extension;
  } catch (error) {
    console.error("Error occurred while getting file extension:", error);
    return null;
  }
}

export default function ReplymsgView({
  SelectedOptionItem,
  mode,
}: {
  SelectedOptionItem: { type: any; file_URL: string; thumbnail: any; message: any };
  mode: "active" | "list";
}) {
  const [display] = useAtom(singleRoom);
  const { comonContact } = useSelector((state: RootState) => state.Contact);
  const { MyProfile } = useSelector((state: RootState) => state.Chat);
  const fileNameText = useMemo(() => {
    const filename = SelectedOptionItem?.file_URL?.split("/")?.pop();
    return getFileName(filename);
  }, []);

  const FormattedMessage = useMemo(() => {
    const regex = /@\[([^\]]+)\]\(([a-zA-Z0-9]{24})\)/g;
    let resultMessage = SelectedOptionItem?.message;
    const matches = resultMessage?.match(regex) ?? [];

    // console.log(message, matches);
    if (matches?.length > 0) {
      const ids = [];
      for (let i = 0; i < matches?.length; i++) {
        const start = matches[i]?.indexOf("(");
        const end = matches[i]?.indexOf(")");
        const userID = matches[i]?.slice(start + 1, end);
        const phoneStart = matches[i]?.indexOf("[");
        const phoneEnd = matches[i]?.indexOf("]");
        const phone = matches[i]?.slice(phoneStart + 1, phoneEnd - 1);

        if (display.currentUserUtility.user_id == userID) {
          ids?.push("You");
        } else {
          const isExist = comonContact.find((contact) => contact.userId?._id == userID);
          if (isExist) {
            ids?.push(`${isExist.firstName} ${isExist.lastName}`);
          } else {
            ids?.push(phone);
          }
        }
      }

      for (let i = 0; i < matches.length; i++) {
        resultMessage = resultMessage?.replace(matches[i], ` @${ids[i]} @`);
      }
    }

    return resultMessage;
  }, []);

  const ReplyMessageView = () => {
    switch (SelectedOptionItem?.type) {
      case "IMAGE":
        // console.log(SelectedOptionItem);
        return (
          <View
            style={{
              flexDirection: mode == "active" ? "row" : "column",
              justifyContent: "space-between",
              alignItems: mode == "active" ? "center" : "flex-start",
              backgroundColor: "white",
              marginTop: 5,
              paddingVertical: 5,
              paddingHorizontal: 10,
              borderRadius: 6,
              borderColor: "rgba(51.51.51,1)",
              borderWidth: 0.5,
            }}
          >
            <View style={{ marginBottom: 5, marginLeft: mode == "active" ? 20 : 0 }}>
              <Text size="xs" style={{ fontWeight: "700" }}>
                Image
              </Text>
              {mode == "active" && <Text size="xs">{fileNameText}</Text>}
            </View>
            <View style={{ height: 80, width: 80, backgroundColor: "white", borderRadius: 6, marginTop: 3 }}>
              <FastImage
                source={{ uri: `${DefaultImageUrl}${SelectedOptionItem?.file_URL}`, priority: "high" }}
                style={{ height: "100%", width: mode == "active" ? "50%" : "100%", borderRadius: 6 }}
              />
            </View>
          </View>
        );

      case "text":
        return (
          <>
            {FormattedMessage.length > 0 && (
              <View style={{ marginBottom: 3 }}>
                <FormatTextRender searchText="" message={FormattedMessage.slice(0, 200)} />
              </View>
            )}
          </>
        );

      case "AUDIO":
        if (SelectedOptionItem?.file_URL && SelectedOptionItem?.file_URL.length > 0) {
          const extension = getFileExtension(SelectedOptionItem?.file_URL);
          if (extension) {
            return (
              <View
                style={{
                  marginTop: 5,
                  marginHorizontal: 5,
                }}
              >
                <Text style={{ fontSize: 15, marginBottom: 3 }}>{extension.toUpperCase()}</Text>
                <View style={{ backgroundColor: "white", paddingVertical: 2, paddingHorizontal: 2, borderRadius: 3 }}>
                  <Text style={{ fontSize: 12, marginBottom: 3 }}>{fileNameText}</Text>
                </View>
              </View>
            );
          } else {
            return <Text style={{ fontSize: 12, marginLeft: 5 }}>Document Not found</Text>;
          }
        } else {
          return <Text style={{ fontSize: 12, marginLeft: 5 }}>Document Not found</Text>;
        }
      case "VIDEO":
      case "APPLICATION":
      case "DOCUMENT":
        return <DocumentPreview item={{ ...SelectedOptionItem, fileURL: SelectedOptionItem.file_URL }} />;
      case "contact":
        if (SelectedOptionItem?.message && SelectedOptionItem?.message.length > 0) {
          const message = JSON.parse(SelectedOptionItem?.message);
          const name =
            message.firstName + message.lastName == message.phone ? "" : message.firstName + message.lastName;
          return (
            <ChatContactView
            
              ContactInfo={message}
              MyProfile={MyProfile}
              item={message}
            />
          );
        } else {
          return (
            <View
              style={{
                marginTop: 5,
                marginHorizontal: 5,
              }}
            >
              <Text style={{ fontSize: 15, marginBottom: 3 }}>Contact</Text>
              <View style={{ backgroundColor: "white", paddingVertical: 2, paddingHorizontal: 2, borderRadius: 3 }}>
                <Text style={{ fontSize: 12, marginBottom: 3 }}>Contact Not found</Text>
              </View>
            </View>
          );
        }
      default:
        break;
    }
  };

  return (
    <View style={{ width: "100%" }}>
      <ReplyMessageView />
    </View>
  );
}
