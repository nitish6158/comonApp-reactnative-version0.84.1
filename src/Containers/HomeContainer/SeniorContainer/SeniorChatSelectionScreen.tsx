import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import SeniorHeader from "./components/SeniorHeader";
import { useAtomValue } from "jotai";
import { AllChatRooms } from "@/Atoms";
import FastImage from "@d11/react-native-fast-image";
import { DefaultImageUrl } from "@/graphql/provider/endpoints";
import { useAppSelector } from "@/redux/Store";
import { RoomData } from "@/redux/Models/ChatModel";
import AntDesign from "react-native-vector-icons/AntDesign";
import Octicons from "react-native-vector-icons/Octicons";
import { Colors } from "@/Constants";
import ToastMessage from "@/utils/ToastMesage";
import { Button, TextField } from "react-native-ui-lib";
import { useUpdateRoomListSeniorMutation } from "@/graphql/generated/user.generated";
import { SeniorChatSelectionScreenProps } from "@/navigation/screenPropsTypes";
// import RealmContext from "../../../schemas";
// import { BSON } from "realm";
import { useDispatch } from "react-redux";
import { setMyProfile } from "@/redux/Reducer/ChatReducer";
import { useTranslation } from "react-i18next";
import { ContactDetailsDto, SeniorCitizenRoomSchema } from "@/graphql/generated/types";
// const { useRealm } = RealmContext;

export default function SeniorChatSelectionScreen({ navigation }: SeniorChatSelectionScreenProps) {
  const chatRooms = useAtomValue(AllChatRooms);
  // const realm = useRealm();
  const { MyProfile } = useAppSelector((state) => state.Chat);
  const { comonContact } = useAppSelector((state) => state.Contact);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [updateSeniorChatRoomListRequest] = useUpdateRoomListSeniorMutation();
  const [searchText, setSearchText] = useState<string>("");

  const [selectedContact, setSelectedContact] = useState<ContactDetailsDto[]>([]);

  useEffect(() => {
    if (MyProfile?.seniorCitizenRoom) {
      let selected = comonContact.filter((v) => {
        let find = MyProfile?.seniorCitizenRoom.find((b) => b.userId == v.userId?._id);
        if (find) return true;
        else return false;
      });
      setSelectedContact(selected);
    }
  }, [comonContact, MyProfile?.seniorCitizenRoom]);

  const contacts = useMemo(() => {
    return comonContact
      .filter((v) => v.userId?._id !== MyProfile?._id)
      .filter((v) => {
        if (searchText.length == 0) {
          return true;
        } else {
          const searchTerm1 = `${v.firstName} ${v.lastName}`.split(" ");
          const searchTerm2 = v.phone;
          if (searchTerm1.find((f) => f.startsWith(searchText)) || searchTerm2.includes(searchText)) {
            return true;
          } else {
            return false;
          }
        }
      })
      .sort((a, b) => `${a.firstName ?? ""}`.localeCompare(`${b.firstName ?? ""}`));
  }, [comonContact, searchText]);

  return (
    <View style={styles.main}>
      <Pressable onPress={onBackPress}>
        <AntDesign name="arrowleft" size={25} color="black" />
      </Pressable>

      <View style={{ alignItems: "center", marginTop: 10 }}>
        <TextField
          style={{
            width: 350,
            borderWidth: 0.5,
            borderColor: "gray",
            height: 45,
            borderRadius: 30,
            paddingHorizontal: 20,
          }}
          placeholder={t("reminders.search-participants")}
          onChangeText={setSearchText}
        />
      </View>
      <Text style={styles.headingText}>{t("seniorMode.senior-room-selection-heading")}</Text>
      <FlatList
        data={contacts}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          let isSelected = selectedContact.find((v) => v.userId?._id == item.userId?._id);
          return (
            <Pressable style={styles.roomContainer} key={index} onPress={() => roomPressed(item)}>
              <View style={styles.room}>
                <FastImage style={styles.profile} source={{ uri: `${DefaultImageUrl}${item.userId?.profile_img}` }} />
                <Text style={styles.roomText}>{`${item.firstName ?? ""} ${item.lastName ?? ""}`}</Text>
              </View>
              <View>
                {isSelected ? (
                  <Octicons name="check-circle-fill" size={25} color={Colors.light.PrimaryColor} />
                ) : (
                  <Octicons name="circle" size={25} color={Colors.light.PrimaryColor} />
                )}
              </View>
            </Pressable>
          );
        }}
      />
      <View style={{ paddingVertical: 20, paddingHorizontal: 20 }}>
        <Button
          onPress={updateSeniorModeChatroom}
          label={`${t("btn.save")}`}
          size={Button.sizes.medium}
          backgroundColor={Colors.light.PrimaryColor}
          disabled={loading}
        />
      </View>
    </View>
  );

  function onBackPress() {
    if (MyProfile && MyProfile?.seniorCitizenRoom.length > 0) {
      navigation.goBack();
    } else {
      navigation.navigate("SeniorProfileScreen", {});
    }
  }

  function updateSeniorModeChatroom() {
    setLoading(true);
    updateSeniorChatRoomListRequest({
      variables: {
        input: {
          _id: MyProfile?._id,
          userIds: selectedContact.map((v) => v.userId?._id),
        },
      },
    }).then((res) => {
      if (res.data?.updateRoomListSenior) {
        const updatedSeniorRooms = selectedContact.map((contact) => {
          const userId = contact.userId?._id;
          const room = chatRooms.find((oneRoom: RoomData) => {
            if (oneRoom.type !== "individual") return false;
            const participantIds = (oneRoom.participants || []).map((participant: any) => {
              const uid = participant?.user_id;
              return typeof uid === "string" ? uid : uid?._id || uid?.id || "";
            });
            return participantIds.includes(userId ?? "");
          });

          return {
            roomId: room?._id || "",
            userId: userId || "",
          };
        });

        dispatch(
          setMyProfile({
            ...MyProfile,
            seniorCitizenRoom: updatedSeniorRooms,
          } as any)
        );

        setLoading(false);
        if (updatedSeniorRooms.length === 0) {
          navigation.replace("SeniorProfileScreen", {});
        } else {
          navigation.replace("SeniorChatScreen", {});
        }
      } else {
        setLoading(false);
      }
    })
  }

  function roomPressed(contact: ContactDetailsDto) {
    let updated = [...selectedContact];

    let isSelected = updated.find((v) => v.userId?._id == contact.userId?._id);
    if (isSelected) {
      setSelectedContact(updated.filter((v) => v.userId?._id !== contact.userId?._id));
    } else {
      if (updated.length == 10) {
        ToastMessage(t("seniorMode.max-user"));
        return;
      }
      updated.push(contact);
      setSelectedContact(updated);
    }
  }
}

const styles = StyleSheet.create({
  main: {
    backgroundColor: "white",
    flex: 1,
    paddingHorizontal: 10,
  },
  room: {
    flexDirection: "row",
    alignItems: "center",
  },
  roomContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  profile: {
    height: 40,
    width: 40,
    borderRadius: 30,
    marginRight: 10,
  },
  roomText: {},
  headingText: {
    textAlign: "center",
    maxWidth: 350,
    alignSelf: "center",
    paddingTop: 20,
    marginBottom: 10,
  },
  subheadingText: {
    fontSize: 12,
    color: "gray",
    textAlign: "center",
    maxWidth: 350,
    alignSelf: "center",
    paddingBottom: 20,
  },
});
