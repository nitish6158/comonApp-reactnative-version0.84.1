import { Linking, Pressable, Text, View } from "react-native";

import Colors from "@/Constants/Colors";
import DeleteMessageText from "@Util/chatUtils/deleteMessageText";
import React from "react";
import StarGray from "@Images/Favorite/StarGray.svg";
import fonts from "@/Constants/fonts";
import isActiveAction from "@Util/helpers/isActionActive";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/redux/Store";

const TextMessagePreview = ({ isGroup, searchText, item, formatedParticipants }: any) => {
  const myId = useAppSelector((state) => state.Chat.MyProfile?._id);
  const { t } = useTranslation();
  function validURL(str: string) {
    const pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator
    return !!pattern.test(str);
  }

  function renderText(message: string, isLast: boolean, customStyle = {}) {
    return (
      <Text
        ellipsizeMode="tail"
        style={{
          color: item?.sender == myId ? Colors.light.White : "black",
          fontFamily: fonts.Lato,
          fontSize: 17,
          ...customStyle,
        }}
      >
        {highlightText(message)}
        {isLast ? "" : " "}
      </Text>
    );
  }
  function otherTypeOfText(message: string, isLast: boolean) {
    if (validURL(message)) {
      return <Pressable onPress={() => Linking.openURL(message)}>{renderText(message, isLast)}</Pressable>;
    } else if (message.startsWith("```") && message.endsWith("```")) {
      return renderText(message.substring(3, message.length - 3), isLast, { fontFamily: fonts.mono });
    } else if (message.startsWith("~") && message.endsWith("~")) {
      return renderText(message.substring(1, message.length - 1), isLast, { textDecorationLine: "line-through" });
    } else if (message.startsWith("_") && message.endsWith("_")) {
      return renderText(message.substring(1, message.length - 1), isLast, { fontStyle: "italic" });
    } else if (message.startsWith("*") && message.endsWith("*")) {
      return renderText(message.substring(1, message.length - 1), isLast, { fontWeight: "bold" });
    } else {
      return renderText(message, isLast);
    }
  }

  function replaceParticipantIdWithThereName(message: any) {
    const newText = message.split(" ");
    const result: any = [];
    newText.forEach((one: any, index: any) => {
      const isLast = index === newText.length - 1;
      if (one[0] === "@") {
        const uId = one.substring(1);
        if (formatedParticipants[uId]) {
          result.push(
            <Pressable
              disabled={!isGroup}
              onPress={() => {}}
              style={{
                backgroundColor: item.sender == myId ? "white" : Colors.light.PrimaryColor,
                paddingHorizontal: 4,
                borderRadius: 3,
                marginRight: isLast ? 0 : 2,
                marginBottom: 2,
              }}
            >
              <Text
                style={{
                  color: item.sender === myId ? Colors.light.PrimaryColor : "white",
                }}
              >
                {highlightText(`@${formatedParticipants[uId]}`)}
              </Text>
            </Pressable>
          );
        } else {
          result.push(otherTypeOfText(one, isLast));
        }
      } else {
        result.push(otherTypeOfText(one, isLast));
      }
    });

    return (
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: "95%" }}>
        <Text>{result}</Text>
      </View>
    );
  }

  function highlightText(message: string) {
    if (searchText?.length < 1) {
      return message;
    } else {
      const searchIndex = message.toLocaleLowerCase().search(searchText.toLocaleLowerCase());
      if (searchIndex === -1) {
        return message;
      } else {
        const first = message.substring(0, searchIndex);
        const middle = message.substring(searchIndex, searchIndex + searchText.length);
        const last = message.substring(searchIndex + searchText.length);
        return (
          <Text>
            {first}
            <Text style={{ backgroundColor: "rgba(17, 90, 187, 0.3)" }}>{middle}</Text>
            {last}
          </Text>
        );
      }
    }
  }
  return (
    <View style={{ flexDirection: "row" }}>
      {replaceParticipantIdWithThereName(
        item?.deleted[0]?.type !== "everyone" ? item?.message : DeleteMessageText(item.deleted, myId, t)
      )}

      <View style={{ alignSelf: "flex-end", width: 30 }}>
        {isActiveAction(item.favourite_by, myId) && <StarGray />}
      </View>
    </View>
  );
};

export default TextMessagePreview;
