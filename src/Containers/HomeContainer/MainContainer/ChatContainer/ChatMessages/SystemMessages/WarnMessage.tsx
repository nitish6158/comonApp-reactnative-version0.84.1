import React from "react";
import { ActivityIndicator, TouchableOpacity, View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "@/Components";
import { getTranslatedMessage } from "./SystemMessage.utils";
import { Colors, fonts } from "@/Constants";
import { windowWidth } from "@/utils/ResponsiveView";

type WarnMessageProps = {
  fullMessage: any;
  Message: string;
  userone: string;
  usertwo: string;
  isInvitation: boolean;
  onPress: (type: "accept" | "decline" | "view") => void;
  invitationRenderer: boolean;
  loader: { status?: string; id?: string } | undefined;
};

export default function WarnMessage({
  fullMessage,
  Message,
  userone,
  usertwo,
  isInvitation,
  onPress,
  invitationRenderer,
  loader,
}: WarnMessageProps) {
  const { t } = useTranslation();

  const renderButton = (type: "accept" | "decline" | "view", label: string, backgroundColor: string) => (
    <TouchableOpacity
      style={[styles.buttonStyle, { backgroundColor }]}
      onPress={() => onPress(type)}
      disabled={loader?.status === type}
    >
      {loader?.status === type && fullMessage?._id === loader?.id ? (
        <ActivityIndicator color={Colors.light.White} size={15} />
      ) : (
        <Text style={[styles.textTypo, { color: Colors.light.White, fontWeight: "600", fontSize: 12 }]}>
          {t(label)}
        </Text>
      )}
    </TouchableOpacity>
  );



  return (
    <View style={[styles.MainMessageContainer, styles.MainMessageContainer1, { marginBottom: 5, maxWidth: "80%" }]}>
      <Text size="xs" style={{ textAlign: "center", lineHeight: 20 }} lineNumber={5}>
        {userone} {getTranslatedMessage(Message, t)} {usertwo}
      </Text>
      {invitationRenderer &&
        (isInvitation ? (
          <View style={[styles.rowDirection, { justifyContent: "space-between" }]}>
            {renderButton("accept", "btn.accept", Colors.light.PrimaryColor)}
            {renderButton("decline", "btn.decline", Colors.light.red)}
          </View>
        ) : (
          renderButton("view", "viewOrg", Colors.light.PrimaryColor)
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  buttonStyle: {
    padding: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 30,
    marginVertical: 5,
    marginHorizontal: 20,
  },
  MainMessageContainer: {
    borderRadius: 10,
    marginVertical: 10,
    padding: 8,
  },
  MainMessageContainer1: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: Colors.light.HighLighter,
    justifyContent: "center",
    marginTop: 10,
    marginVertical: 0,
    // maxWidth: 250,
  },
  messageContainer: {
    alignSelf: "flex-end",
    borderRadius: 4.5,
    flexDirection: "row",
    marginHorizontal: 5,
    maxWidth: "70%",
  },

  message: {
    alignSelf: "flex-start",
    color: "white",
    fontSize: 15,
  },
  textTypo: {
    fontFamily: fonts.Lato,
    fontStyle: "normal",
  },
  rowDirection: {
    alignItems: "center",
    flexDirection: "row",
  },
  recevierTime: { color: Colors.light.black, marginLeft: 4, textAlign: "right" },
  recevierTimeCon: { alignSelf: "flex-start", flex: 2, marginTop: 5 },
  senderTimeCon: { alignSelf: "flex-start", marginTop: 5, width: 70 },
  sendertime: { color: Colors.light.normalGray, paddingLeft: 10 },
  time: {
    alignSelf: "flex-end",
    color: "lightgray",
    fontSize: 10,
  },
});
