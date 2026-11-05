import Autolink, { IntlPhoneMatcher, LatLngMatcher, PhoneMatchersByCountry } from "react-native-autolink";
import { FORMATTED_LINK_MATCH_TYPE, FormattedText } from "react-native-formatted-text";
import React, { useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ChatRoom } from "@Models/chatrooms";
import { Conversation } from "@Models/chatmessage";
import { useAppSelector } from "@/redux/Store";
import { fonts } from "@/Constants";

interface props {
  message: Conversation["message"];
  participants?: ChatRoom["participants"];
  isgroup?: undefined | boolean;
  searchText?: string;
}

export default function FormatTextRender({ searchText, message }: props) {
  const { MyProfile } = useAppSelector((state) => state.Chat);
  const matchers = useMemo(() => {
    const match = [
      { regex: /\*(.*?)\*/g, style: { fontWeight: "bold" } },
      { regex: /@(.*?)@/g, style: { color: "green" } },
      { regex: /_([^_]+)_/g, style: { fontStyle: "italic" } },
      { regex: /~(.*?)~/g, style: { textDecorationLine: "line-through" } },
      { regex: /```(.*?)```/g, style: { fontFamily:fonts.mono } },
    ];
    if (searchText && searchText.length > 0) {
      match.push({ regex: new RegExp(searchText, "gi"), style: { backgroundColor: "yellow" } });
    }
    return match;
  }, [searchText]);

  return (
    <Autolink
      text={message}
      url={true}
      matchers={[LatLngMatcher]}
      showAlert={true}
      renderText={(text) => {
        return (
          <FormattedText style={{ fontSize: MyProfile?.mode == "CLASSIC" ? 14 : 18 }} matches={matchers}>
            {text}
          </FormattedText>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {},
});
