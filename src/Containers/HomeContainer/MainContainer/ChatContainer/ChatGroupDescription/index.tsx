import { Pressable, TextInput, View } from "react-native";
import React, { useState } from "react";

import CommonHeader from "@Components/header/CommonHeader";
import CommonLoader from "@Components/CommonLoader";
import Text from "@Components/Text";
import { navigate, navigateBack } from "@Navigation/utility";
import { produce } from "immer";
import { singleRoom } from "@Atoms/singleRoom";
import { styles } from "./styles";
import { useAtom } from "jotai";
import { useNavigation } from "@react-navigation/core";
import { useTranslation } from "react-i18next";
import { socket } from "@/redux/Reducer/SocketSlice";
import { socketConnect } from "@/utils/socket/SocketConnection";
import { socketManager } from "@/utils/socket/SocketManager";

// create a component
const GroupDescription = () => {
  const [loading, setLoading] = useState(false);
  const [display, setDisplay] = useAtom(singleRoom);
  const [description, setDescription] = useState(display.roomDescription);
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <>
      <CommonHeader
        title={t("others.Group description")}
      />
      <View style={styles.container}>
        {loading && <CommonLoader />}
        <TextInput
          onChangeText={(e) => setDescription(e)}
          value={description}
          style={styles.textinput}
          placeholder={t("chatProfile.add-group-description")}
          multiline={true}
          maxLength={100}
          numberOfLines={4}
        />
        <Pressable
          onPress={() => {
            socketConnect.emit("setRoomDescription", {
              roomId: display.roomId,
              desc: description,
              roomType: display?.roomType,
            });
            setDisplay(
              produce(display, (draftDisplay) => {
                draftDisplay.roomDescription = description;
              })
            );
            setTimeout(() => {
              socketManager.chatRoom.fetchAndUpdateRooms();
              // socketManager.chatRoom.registerStateSetters(
              //   setChatRooms,
              //   setArchiveRooms,
              //   MyProfile?._id || "",
              //   activeContactsData
              // );
            }, 1000);
            // navigate("ChatProfileScreen", {});
            navigateBack()
          }}
          style={{
            borderWidth: 1,
            borderRadius: 10,
            marginHorizontal: 20,
            marginTop: 20,
            paddingVertical: 10,
          }}
        >
          <Text style={{ textAlign: "center" }} size="lg">
            {t("btn.save")}
          </Text>
        </Pressable>
      </View>
    </>
  );
};

//make this component available to the app
export default GroupDescription;
