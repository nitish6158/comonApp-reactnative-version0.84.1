import { Pressable, Text, View } from "react-native";
import React, { useEffect, useMemo, useState } from "react";

import ArchiveChat from "@Images/ArchiveChat.svg";
import { currentUserIdAtom } from "@Atoms/RealmloginManager";
import { navigate } from "@Navigation/utility";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import { ArchiveRoomsAtom } from "@Atoms/allRoomsAtom";

export default function ArchiveContainer() {
  const { t } = useTranslation();
  const MyProfile = useAtomValue(currentUserIdAtom);
  const archivedRooms = useAtomValue(ArchiveRoomsAtom);

  const ArchiveCount = useMemo(() => {
    return archivedRooms.length;
  }, [archivedRooms]);

  if (ArchiveCount == 0) {
    return <></>;
  } else {
    return (
      <Pressable
        style={{
          flexDirection: "row",
          paddingHorizontal: 20,
          paddingVertical: 10,
          marginHorizontal: 15,
          borderRadius: 20,
          marginTop: 15,
          marginBottom: 5,
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#F3F9FC"
        }}
        onPress={() => {
          navigate("ArchiveChatListScreen", {});
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <ArchiveChat />
          <Text style={{ marginLeft: 10 }}>{t("chat-screen.ArchiveChats")}</Text>
        </View>
        <Text>{ArchiveCount}</Text>
      </Pressable>
    );
  }
}
