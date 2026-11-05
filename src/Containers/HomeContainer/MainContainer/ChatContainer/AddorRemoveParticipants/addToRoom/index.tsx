import { DefaultImageUrl, ImageUrl } from "@Service/provider/endpoints";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
//import liraries
import React, { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/core";

import AntDesign from "react-native-vector-icons/AntDesign";
import Colors from "@/Constants/Colors";
import CommonLoader from "@Components/CommonLoader";
import Ionicons from "react-native-vector-icons/Ionicons";
import { RootState } from "@Store/Reducer";
import SearchInput from "@Components/SearchInput";
import ToastMessage from "@Util/ToastMesage";
import { navigate, navigateBack } from "@Navigation/utility";
import { serverContactType } from "@Store/Reducer/ContactReducer";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom, useAtomValue } from "jotai";
import { useJoinRoomMutation } from "@Service/generated/room.generated";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { filterInObject } from "@/Containers/HomeContainer/MainContainer/ProfileContainer/contacts/FilterContact";
import _ from "lodash";
import { produce } from "immer";
import { socketManager } from "@/utils/socket/SocketManager";
import { last } from "rxjs";
// create a component
function AddToRooms({ route }: any) {
  const navigation = useNavigation();
  const Participants = useSelector(
    (state: RootState) => state.Contact.comonContact
  );

  const { comonContact } = useSelector((state: RootState) => state.Contact);
  // const display = useAtomValue(singleRoom);
  const [availableParticipants, setAvailableParticipants] = useState<
    serverContactType[]
  >([]);
  const [SearchValue, SetSearchValue] = useState("");
  const [onJoinRoom, { loading }] = useJoinRoomMutation();
  const [display, setDisplay] = useAtom(singleRoom);
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      // console.log("comonContacts=====>", display.participants);
      const doNotIncludeThisUser = display.participants.filter(
        (item) => item.left_at == 0
      );
      const unique = _.uniqBy(Participants, (item) => item.phone);

      const IncludeThisUser = unique.filter((par) => {
        const userFound = doNotIncludeThisUser.filter(
          (dn) => dn.user_id == par.userId?._id
        );
        if (userFound.length > 0) {
          return false;
        } else {
          return true;
        }
      });
      setAvailableParticipants(
        IncludeThisUser.map((itu) => {
          return { ...itu, isSelected: false };
        })
      );
    }, [Participants])
  );

  const addParticipants = useCallback(() => {
    const selectedGroupData = availableParticipants.filter(
      (ap) => ap.isSelected == true
    );
    const users = selectedGroupData.map((ap) => ap.userId?._id);

    socketManager.chatRoom.addParticioants(
      {
        roomId: display.roomId,
        user_type: "common",
        users: users,
      },
      (data) => {
        const newArr = data.participants?.filter((ele) => ele?.left_at == 0);

        let room = {
          ...display,
          participants: data.participants,
          participantsNotLeft: newArr,
        };
        setDisplay(room);
        ToastMessage("Particioant added successfully");
        socketManager.chatRoom.fetchAndUpdateRooms();
        navigation.goBack();
      }
    );

    return;
    const selectedGroup = availableParticipants.filter(
      (ap) => ap.isSelected == true
    );

    console.log(selectedGroup);
    // return
    if (selectedGroup.length > 0) {
      const payload = {
        roomId: display.roomId,
        user_type: "common",
        users: selectedGroup.map((mp) => mp.userId?._id),
      };
      console.log("Payload", payload);
      onJoinRoom({
        variables: {
          input: payload,
        },
      })
        .then((res) => {
          console.log("res----->", res);
          if (res.data?.joinRoom.success) {
            socketManager.chatRoom.fetchAndUpdateRooms();

            // setDisplay(
            //   produce(display, (draftDisplay) => {
            //     draftDisplay.participantsNotLeft =
            //       display.participantsNotLeft?.filter(
            //         (el) => el.user_id == item.user_id
            //       );
            //   })
            // );
            ToastMessage(res.data?.joinRoom.message);
            navigation.goBack();
          }
        })
        .catch((er) => { });
    } else {
      ToastMessage(`${t("toastmessage.select-participants-message")}`);
    }
  }, [availableParticipants]);

  const filtered = filterInObject({
    searchText: SearchValue,
    data: availableParticipants,
  });

  return (
    <View style={Styles.MainContainer}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginHorizontal: 20,
          marginVertical: 10,
          // width: width,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons
            name="chevron-back"
            size={22}
            style={{ marginRight: 5 }}
            onPress={() => 
              // navigation.navigate("ChatRoomSettingScreen", {})
              navigateBack()
            }
          />
          <Text>{display.roomName}</Text>
        </View>
        <Text
          style={{ paddingHorizontal: 10, fontSize: 16, fontWeight: "500" }}
          onPress={addParticipants}
        >
          {t("others.Add")}
        </Text>
      </View>
      <SearchInput
        SearchValue={SearchValue}
        SetSearchValue={SetSearchValue}
        placeHolder="Search Contacts"
      />
      <FlatList
        style={{ marginTop: 20 }}
        ListEmptyComponent={
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text>{t("others.No User Available to add")}</Text>
          </View>
        }
        data={filtered}
        renderItem={({ item, index }) => {
          return (
            <Pressable
              key={index}
              onPress={() => {
                if (!item.blocked) {
                  console.log(availableParticipants);
                  // return
                  const modified = availableParticipants.map((ap) => {
                    if (item.userId?._id == ap.userId?._id) {
                      return { ...ap, isSelected: !ap.isSelected };
                    } else {
                      return ap;
                    }
                  });
                  // console.log(modified)
                  setAvailableParticipants(modified);
                } else {
                  ToastMessage(
                    `${t("toastmessage.please-unblock")} ${item.firstName + " " + item.lastName
                    } ${t("toastmessage.to-add-into")} ${display.roomName}`
                  );
                }
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 8,
                justifyContent: "space-between",
                marginHorizontal: 20,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  style={{ height: 45, width: 45, borderRadius: 50 }}
                  source={{
                    uri: item.userId?.profile_img
                      ? `${DefaultImageUrl}${item.userId?.profile_img}`
                      : `${DefaultImageUrl}${ImageUrl}`,
                  }}
                />
                <View style={{ marginLeft: 10 }}>
                  <Text style={{ fontSize: 16 }}>
                    {item.firstName + " " + item.lastName}
                  </Text>
                  <Text style={{ fontSize: 14, color: "rgba(51,51,51,.7)" }}>
                    {item.phone}
                  </Text>
                </View>
              </View>
              {item.blocked && (
                <Text
                  style={{ fontSize: 13, fontWeight: "500", color: "gray" }}
                >
                  Blocked
                </Text>
              )}
              {item.isSelected && (
                <AntDesign name="checkcircle" color="green" size={22} />
              )}
            </Pressable>
          );
        }}
      />
      {loading && <CommonLoader />}
    </View>
  );
}

// define your styles

const Styles = StyleSheet.create({
  AvataarContainer: {
    borderRadius: 50,
    height: 50,
    overflow: "hidden",
    width: 50,
  },
  CheckIcon: { marginHorizontal: 10, marginTop: 16 },
  CheckIconContainer: { alignItems: "center", justifyContent: "center" },
  Container: {
    backgroundColor: Colors.light.background,
    flexDirection: "row",
    height: 82,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  MainContainer: {
    backgroundColor: "white",
    flex: 1,
  },
  Name: { marginLeft: 10, marginTop: 5 },
  TimeText: { color: Colors.light.grayText, fontSize: 13 },
});

//make this component available to the app
export default AddToRooms;
