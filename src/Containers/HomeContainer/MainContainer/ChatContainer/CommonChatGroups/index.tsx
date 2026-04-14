import { FlatList, Pressable, StyleSheet, View } from "react-native";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AllChatRooms } from "@Atoms/allRoomsAtom";
import AvtaarWithoutTitle from "@Components/AvtaarWithoutTitle";
import Colors from "@/Constants/Colors";
import CommonHeader from "@Components/header/CommonHeader";

import { DefaultImageUrl } from "@Service/provider/endpoints";
import { RoomsDataList } from "@Store/Models/ChatModel";
import { RootState } from "@Store/Reducer";
import Text from "@Components/Text";
import { navigate } from "@Navigation/utility";
import { produce } from "immer";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom } from "jotai";
import { useGetRoomInComonQuery } from "@Service/generated/room.generated";
import { useTranslation } from "react-i18next";
import { socket } from "@/redux/Reducer/SocketSlice";
import { socketConnect } from "@/utils/socket/SocketConnection";

// create a component
const GroupsInCommon = ({ navigation }: any) => {
  // const CommonGroupList = useSelector((state: RootState) => state.Chat.GetChatsInCommonList);
  const MyProfile = useSelector((state: RootState) => state.Chat.MyProfile);
  const [display] = useAtom(singleRoom);
  const [chatRooms] = useAtom(AllChatRooms);
  const { comonContact } = useSelector((state: RootState) => state.Contact);
  const getComonRooms = useGetRoomInComonQuery({ variables: { input: { _id: display.participants[0].user_id } } });

  const [CommonGroupList, setComonGroupList] = useState([]);
  const { t } = useTranslation();
  useEffect(() => {
    const data = getComonRooms.data?.getRoomInComon;
    if (data != null) {
      const formattedRoom = produce(data, (draftRooms: RoomsDataList) => {
        return draftRooms.map((dr) => {
          const found = chatRooms.find((cr) => cr._id == dr._id);
          return found;
        });
      });

      setComonGroupList(formattedRoom);
    }
  }, [getComonRooms.data?.getRoomInComon]);


  return (
    <>
      <CommonHeader title={t("others.Groups in common")} screenName="ChatProfileScreen" />
      <View style={styles.container}>
        <FlatList
          data={CommonGroupList}
          renderItem={({ item }) => {
            return (
              <Pressable
                style={{ flexDirection: "row", marginVertical: 10 }}
                onPress={() => {
                  socketConnect.emit("getChatsByRoomId", { roomId: item?._id });

                  navigate("ChatMessageScreen", {
                    RoomId: item?._id,
                    // Pid: item?._id,
                    // CreateRoom: false,
                    // UserId: item?.participants[value]?.user_id,
                    // type: item?.type,
                    // Name: item.display.UserName,
                    // UserImage: item.display.UserImage,
                    // RoomItem: item,
                  });
                }}
              >
                <AvtaarWithoutTitle
                  ImageSource={{ uri: `${DefaultImageUrl}${item?.display?.UserImage}` }}
                  AvatarContainerStyle={styles.AvataarCon}
                />
                <View style={{ flex: 0.9 }}>
                  <Text>{item?.display?.UserName}</Text>
                  <View style={{ flexDirection: "row", width: 220, overflow: "hidden" }}>
                    <Text size="sm" style={{ color: Colors.light.grayText, marginTop: 10, marginHorizontal: 3 }}>
                      {item?.participants?.length} {t("group-common.participants")}
                    </Text>
                  </View>
                </View>
                <Text style={{ color: Colors.light.grayText }} ellipsizeMode="tail">
                  { }
                </Text>
              </Pressable>
            );
          }}
        />
      </View>
    </>
  );
};

// define your styles
const styles = StyleSheet.create({
  // eslint-disable-next-line react-native/no-color-literals
  container: {
    backgroundColor: "white",
    flex: 1,
  },
  AvataarCon: {
    marginLeft: 20,
    marginRight: 20,
  },
});

//make this component available to the app
export default GroupsInCommon;
