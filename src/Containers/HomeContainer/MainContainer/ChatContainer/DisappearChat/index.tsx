import { Pressable, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";

import CheckMark from "@Images/Profile/GreenCheckDis.svg";
import Colors from "@/Constants/Colors";
import CommonHeader from "@Components/header/CommonHeader";
import Text from "@Components/Text";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { windowHeight } from "@Util/ResponsiveView";
import { socket } from "@/redux/Reducer/SocketSlice";
import { ChatDisappearSettingScreenProps } from "../../../../../navigation/screenPropsTypes";
import { socketConnect } from "@/utils/socket/SocketConnection";

export default function Disappear({ navigation }: ChatDisappearSettingScreenProps) {
  const [display, setDisplay] = useAtom(singleRoom);
  const disappearData = ["On", "Off"];
  const [activeTab, setActiveTab] = useState<string>("Off");
  const { t } = useTranslation();

  useEffect(() => {
    setActiveTab(display.isCurrentRoomDisappearedMessageOn ? "On" : "Off");
  }, []);

  return (
    <>
      <CommonHeader title={t("others.Disappearing messages")} />
      <View style={styles.container}>
        {disappearData.map((item) => {
          return (
            <Pressable
              onPress={() => {
                HandleDisappering(item);
              }}
              // eslint-disable-next-line react-native/no-inline-styles
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                height: windowHeight / 25,
                marginHorizontal: 20,
                alignItems: "center",
                marginVertical: 5,
              }}
            >
              <Text>{item}</Text>
              {item == activeTab && <CheckMark />}
            </Pressable>
          );
        })}
        <Text
          lineNumber={4}
          style={{ marginHorizontal: 20, marginTop: 10, color: Colors.light.Hiddengray, lineHeight: 18 }}
          size="xs"
        >
          {t("disapper-messages.description")}
        </Text>
      </View>
    </>
  );

  function HandleDisappering(DisappearStatus: React.SetStateAction<string>) {
    setActiveTab(DisappearStatus);
    if (DisappearStatus !== activeTab) {
      socketConnect.emit("setChatDisappeared", { roomId: display.roomId, type: DisappearStatus });
      setDisplay({
        ...display,
        isCurrentRoomDisappearedMessageOn: DisappearStatus == "On" ? true : false,
      });
      navigation.goBack()
    }
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
  },
});
