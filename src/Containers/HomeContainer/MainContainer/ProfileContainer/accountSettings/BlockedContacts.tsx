import { View, Text, FlatList, Pressable } from "react-native";
import React, { useMemo } from "react";
import { HeaderWithScreenName } from "@Components/header/HeaderWithScreenName";
import { useAtomValue, useSetAtom } from "jotai";
import { currentUserIdAtom } from "@/Atoms";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@Store/Store";
// import RealmContext from "../../../../../schemas";
import FastImage from "@d11/react-native-fast-image";
import { DefaultImageUrl } from "@Service/provider/endpoints";
import AntDesign from "react-native-vector-icons/AntDesign";

import { useTranslation } from "react-i18next";
import { setMyProfile } from "@/redux/Reducer/ChatReducer";
import { socket } from "@/redux/Reducer/SocketSlice";
import { socketConnect } from "@/utils/socket/SocketConnection";
// const {  useQuery} = RealmContext;

type UserProfile = {
  _id: string;
  lastSeen: number;
  phone: string;
  profile_img: string;
  status: "offline" | "online"; // Assuming status can be one of these values
};

export default function BlockedContactsContainers() {
  const allUserStatus:any = [];
  // const allUserStatus = useQuery("user");
  const { MyProfile } = useSelector((state: RootState) => state.Chat);
  const setProfile = useSetAtom(currentUserIdAtom);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const blockedUsers = useMemo(() => {
    let data = MyProfile.blockedRooms.map((item) => {
      let user = allUserStatus.find((e) => e?._id == item.pid);
      let raw = JSON.parse(JSON.stringify(user));
      return { ...raw, ...item };
    });
    return data;
  }, [MyProfile?.blockedRooms.length]);

  return (
    <View style={{ backgroundColor: 'white', flex: 1 }}>
      <HeaderWithScreenName title={t("navigation.BlockedContacts")} />
      <FlatList
        style={{ paddingHorizontal: 20, marginVertical: 20, marginBottom: 80 }}
        data={blockedUsers}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => {
          return (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottomColor: "rgba(51,51,51,.2)",
                borderBottomWidth: 1,
                paddingBottom: 10,
                marginTop: 10,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <FastImage
                  source={{ uri: `${DefaultImageUrl}${item.profile_img}` }}
                  style={{ height: 56, width: 56, borderRadius: 30 }}
                />
                <View style={{ marginLeft: 16 }}>
                  <Text style={{ fontSize: 16, lineHeight: 20 }}>{item.phone}</Text>
                </View>
              </View>
              <Pressable
                onPress={() => {
                  const blockedRooms = MyProfile?.blockedRooms?.filter((br) => br.room_Id != item.room_Id);
                  socketConnect.emit("unblockRoom", { roomId: item.room_Id });

                  dispatch(setMyProfile({ ...MyProfile, blockedRooms: blockedRooms }));
                  setProfile({ ...MyProfile, blockedRooms: blockedRooms });
                }}
              >
                <AntDesign name="closecircle" size={22} color={"red"} />
              </Pressable>
            </View>
          );
        }}
        ListFooterComponent={
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 12, color: "#828282" }}>
              {t("others.Blocked contacts will no longer the able to call you or send you messages.")}
            </Text>
          </View>
        }
      />
    </View>
  );
}
