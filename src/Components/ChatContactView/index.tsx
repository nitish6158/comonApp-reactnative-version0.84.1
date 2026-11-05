import { ContactInfo } from "@Types/types";
import { DefaultImageUrl, ImageUrl } from "@Service/provider/endpoints";
import { Pressable, StyleSheet, View } from "react-native";
import { ProfileData } from "@Store/Models/ChatModel";
import React, { useCallback, useMemo } from "react";

import AvtaarWithoutTitle from "../AvtaarWithoutTitle";
import Colors from "@/Constants/Colors";
import { Conversation } from "@Models/chatmessage";
import Styles from "./styles";
import Text from "../Text";
import { navigate } from "@Navigation/utility";
import { useTranslation } from "react-i18next";

type props = {
  ContactInfo: ContactInfo;
  item: Conversation;
  MyProfile: ProfileData;
}
const ChatContactView = ({ ContactInfo, item, MyProfile }: props) => {
  const { t } = useTranslation();

  const isBlocked = useMemo(() => {
    return MyProfile.blockedRooms.filter((blr) => blr.pid == item.sender).length;
  }, []);

  function MultiContactView() {
    return (
      <Pressable style={{ flex: 1 }} onPress={onContactViewPressed}>
        <Text style={{ color: "black",  fontSize: MyProfile?.mode == "CLASSIC" ? 12 : 14, textAlign: "center" }}>{t("view-all")}</Text>
      </Pressable>
    );
  }

  function BottomAction() {
    if (ContactInfo.groupedContact == undefined) {
      return <></>;
    } else {
      return <MultiContactView />;
    }
  }

  return (
    <View style={styles.main}>
      <Pressable
        style={Styles.container}
        onPress={() => {
          if (ContactInfo?.groupedContact) {
            onContactViewPressed();
          }
        }}
      >
        <AvtaarWithoutTitle
          ImageSource={{ uri: `${DefaultImageUrl}${isBlocked > 0 ? ImageUrl : ContactInfo.profile_img}` }}
          AvatarContainerStyle={Styles.avataarCon}
        />
        <View style={Styles.secondMain}>
          <Text
            style={{
              color: Colors.light.black,
            }}
            size="sm"
          >
            {`${ContactInfo?.firstName} ${ContactInfo?.lastName}`}
          </Text>
        </View>
      </Pressable>
      <View style={[Styles.thirdCon, { backgroundColor: Colors.light.black }]} />
      <View style={{ marginBottom: 5 }}>
        <BottomAction />
      </View>
    </View>
  );

  function onContactViewPressed() {
    navigate("ViewContactScreen", {
      data: ContactInfo,
    });
  }
};

export default ChatContactView;

const styles = StyleSheet.create({
  main: {
    backgroundColor: "rgba(180,255,255,.5)",
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 5,
    maxWidth: 200,
  },
});
