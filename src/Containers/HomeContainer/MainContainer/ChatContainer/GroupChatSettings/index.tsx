//import liraries
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import Colors from "@/Constants/Colors";
import CommonHeader from "@Components/header/CommonHeader";
import CustomModal from "@Components/Comon";
import EditGroup from "@Images/GroupInfo/EditGroup.svg";
import ItemList from "@Components/ItemList";
import Pin from "@Images/GroupInfo/Pin.svg";
import Sendmessage from "@Images/GroupInfo/Sendmessage.svg";
import { navigate } from "@Navigation/utility";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom } from "jotai";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { socket } from "@/redux/Reducer/SocketSlice";
import { socketConnect } from "@/utils/socket/SocketConnection";
import { socketManager } from "@/utils/socket/SocketManager";


const GroupChatSetting = ({ navigation, route }) => {

  const [SendMessageVisible, setSendMessageVisible] = useState(false);
  const [permissionType, setPermissionType] = useState("");

  const [display] = useAtom(singleRoom);

  const { t } = useTranslation();
  const Dispatch = useDispatch();

  // <GroupSettingPermission></GroupSettingPermission>
  const ModalTitle = () => {
    switch (permissionType) {
      case "sendMessage":
        return t("group-info.message-send-title");
      case "pinMessage":
        return t("group-info.message-pin-title");
      case "editInfo":
        return t("group-info.message-edit-title");
      default:
        break;
    }
  };
  const ChangeRoleHandler = (permissionType: string, role: string) => {
    const tempata = display.roomPermission;

    switch (permissionType) {
      case "sendMessage":
        tempata.SendMessagePermission.permit = role;
        break

      case "pinMessage":
        tempata.PinPermission.permit = role;
        break

      case "editInfo":
        tempata.EditInfoPermission.permit = role;
        break

      default:
        break;
    }
  };
  return (
    <>
      <CommonHeader title={t("others.Group Info")} />
      <View style={styles.container}>
        <ItemList
          CountStyle={styles.count}
          Title={t("group-info.send-messages")}
          Count={
            display && display.roomPermission.SendMessagePermission.permit == "admin"
              ? "Only admin"
              : t("group-info.all-participants")
          }
          Icon={<Sendmessage />}
          _onPress={() => {
            setPermissionType("sendMessage");
            setSendMessageVisible(true);
          }}
        />
        <ItemList
          CountStyle={styles.count}
          Title={t("group-info.pin-messages")}
          Count={
            display.roomPermission.PinPermission.permit == "admin" ? "Only admin" : t("group-info.all-participants")
          }
          Icon={<Pin />}
          _onPress={() => {
            setPermissionType("pinMessage");
            setSendMessageVisible(true);
          }}
        />
        <ItemList
          CountStyle={styles.count}
          Title={t("group-info.edit-group-info")}
          Count={
            display.roomPermission.EditInfoPermission.permit == "admin"
              ? "Only admin"
              : t("group-info.all-participants")
          }
          Icon={<EditGroup />}
          _onPress={() => {
            setPermissionType("editInfo");
            setSendMessageVisible(true);
          }}
        />
        <ItemList Title={t("group-info.edit-group-admins")} _onPress={() => navigate("AddChatAdminScreen", {})} />
        <CustomModal
          title={ModalTitle()}
          setModalVisible={setSendMessageVisible}
          modalVisible={SendMessageVisible}
          customButtons={[
            {
              title: t("group-info.all-participants"),
              onPress: () => {
                socketConnect.emit("changeRoomPermission", {
                  roomId: display.roomId,
                  access: { type: permissionType, permit: "common" },
                });
                socketManager.chatRoom.fetchAndUpdateRooms();
                setSendMessageVisible(false);
                ChangeRoleHandler(permissionType, "common");
              },
            },
            {
              title: t("group-info.only-admins"),
              onPress: () => {
                socketConnect.emit("changeRoomPermission", {
                  roomId: display.roomId,
                  access: { type: permissionType, permit: "admin" },
                });
                socketManager.chatRoom.fetchAndUpdateRooms();
                ChangeRoleHandler(permissionType, "admin");

                setSendMessageVisible(false);
              },
            },
          ]}
        />
      </View>
    </>
  );
};

// define your styles
const styles = StyleSheet.create({
  // eslint-disable-next-line react-native/no-color-literals
  container: {
    backgroundColor: Colors.light.White,
    flex: 1,
  },
  count: { marginLeft: 10 },
});

//make this component available to the app
export default GroupChatSetting;
