import { Alert, FlatList, Pressable, StyleSheet, View } from "react-native";
import { DefaultImageUrl, ImageUrl } from "@Service/provider/endpoints";
//import liraries
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Add from "@Images/Profile/add.svg";
import AvtaarWithoutTitle from "@Components/AvtaarWithoutTitle";
import { ListItem } from "react-native-elements";
import { RootState } from "@Store/Reducer/index";
import Text from "@Components/Text";
import { navigate } from "@Navigation/utility";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom } from "jotai";
import { useCreateRoomMutation } from "@Service/generated/room.generated";
import { useTranslation } from "react-i18next";

// create a component
const GroupListItem = ({ navigation, name, GroupImage }: any) => {
  const MyProfile = useSelector((state: RootState) => state.Chat.MyProfile);
  const [active, setActive] = useState(false);
  const { comonContact } = useSelector((state: RootState) => state.Contact);
  const [createRoomRequest, createRoomResponse] = useCreateRoomMutation();

  const [display] = useAtom(singleRoom);
  const { t } = useTranslation();
  const HiddenItem = display.participantsNotLeft?.length == 10 ? display.participantsNotLeft?.length : 10;

  return (
    <View style={{ backgroundColor: "white", paddingBottom: 10 }}>
      <View style={{ height: 10, backgroundColor: "rgba(243,243,243,2)" }}></View>
      <View
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          flexDirection: "row",
          marginHorizontal: 20,
          justifyContent: "space-between",
          marginTop: 20,
          alignItems: "center",
        }}
      >
        <Text style={{ marginBottom: 10, fontWeight: "bold", fontSize: 13 }}>
          {display?.roomType == "broadcast"
            ? display.participantsNotLeft.filter((e) => e?.user_id != MyProfile?._id).length
            : display.participantsNotLeft.length}{" "}
          {t("calls.participants")}
        </Text>
        {/* <GroupSearch /> */}
      </View>

      {display.isCurrentUserAdmin && (
        <Pressable
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            flexDirection: "row",
            marginHorizontal: 20,
            marginTop: 10,
            marginBottom: 5,
            alignItems: "center",
            borderRadius: 10,
          }}
          onPress={() => {
            navigate("ChatRoomSettingScreen", { name: name, GroupImage: GroupImage });
          }}
        >
          <Add />
          <Text style={{ marginLeft: 13 }}>{t("titles.addParticipants")}</Text>
        </Pressable>
      )}
      <FlatList
        data={
          display.roomType == "broadcast"
            ? display.participantsNotLeft
                .filter((e) => e.user_id != MyProfile?._id)
                .slice(0, active ? display.participantsNotLeft.length : 10)
            : display.participantsNotLeft.slice(0, active ? display.participantsNotLeft.length : 10)
        }
        renderItem={({ item, index }) => {
          const activeUserlist = comonContact?.find((users) => users.userId?._id == item.user_id);
          const isBlocked = MyProfile?.blockedRooms?.filter((br) => br.pid == item.user_id).length;

          return (
            <Pressable
              key={index}
              style={{
                marginHorizontal: 20,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginVertical: 10,
              }}
              onPress={() => {
                if (item.user_id != MyProfile?._id) {
                  createRoomRequest({
                    variables: {
                      input: {
                        type: "individual",
                        users: [item.user_id],
                        localId: "0",
                        profile_img: null,
                        name: "",
                      },
                    },
                  })
                    .then((res) => {
                      if (res.data?.createRoom.success) {
                        navigate("ChatMessageScreen", {
                          RoomId: res.data.createRoom.roomId,
                        });
                      } else {
                      }
                    })
                    .catch(() => {});
                }
              }}
            >
              <View style={{ alignItems: "center", flexDirection: "row" }}>
                <AvtaarWithoutTitle
                  ImageSource={{ uri: `${DefaultImageUrl}${isBlocked > 0 ? ImageUrl : item.profile_img}` }}
                  AvatarContainerStyle={{ height: 33, width: 33 }}
                />
                <View style={{ marginLeft: 13, width: 200 }}>
                  <Text style={{ lineHeight: 23 }} ellipsizeMode="tail" numberOfLines={1}>
                    {item.user_id == MyProfile?._id
                      ? "You"
                      : activeUserlist != undefined
                      ? activeUserlist?.firstName + " " + activeUserlist?.lastName
                      : item.phone}
                  </Text>
                  {/* {display.roomDescription.length > 0 && (
                      <Text size="sm" style={{ color: Colors.light.Hiddengray }}>
                        {display.roomDescription}
                      </Text>
                    )} */}
                </View>
              </View>
              {item.user_type == "admin" && (
                <View
                  style={{
                    backgroundColor: "rgba(200,220,220,1)",
                    paddingHorizontal: 10,
                    paddingVertical: 2,
                    borderRadius: 5,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "bold", color: "green" }}>{t("group-info.admin")}</Text>
                </View>
              )}
            </Pressable>
          );
        }}
      />
      {HiddenItem < display.participantsNotLeft?.length && (
        <Pressable
          onPress={() => setActive(!active)}
          style={{
            alignSelf: "flex-start",
            alignItems: "center",
            marginHorizontal: 30,
            flexDirection: "row",
            height: 30,
            width: "50%",
          }}
        >
          <ListItem.Chevron color="black" size={24} style={{ transform: [{ rotate: active ? "-90deg" : "90deg" }] }} />
          {!active ? (
            <Text style={{ marginLeft: 10 }}>
              {display.participantsNotLeft?.length - 10} {t("Hidden-Files.more")}
            </Text>
          ) : (
            <Text style={{ marginLeft: 10 }}>Hide</Text>
          )}
        </Pressable>
      )}
    </View>
  );
};

//make this component available to the app
export default GroupListItem;
