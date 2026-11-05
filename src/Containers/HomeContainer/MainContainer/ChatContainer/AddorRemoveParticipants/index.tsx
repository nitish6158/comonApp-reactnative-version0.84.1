import { DefaultImageUrl, ImageUrl } from "@Service/provider/endpoints";
import { Dimensions, FlatList, Pressable, View } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  useMuteRoomMutation,
  useRemoveUserFromRoomMutation,
} from "@Service/generated/room.generated";

import AnimatedTextInput from "@Components/AnimatedTextInput";
import AntDesign from "react-native-vector-icons/AntDesign";
import AvtaarWithoutTitle from "@Components/AvtaarWithoutTitle";
import Colors from "@/Constants/Colors";
import CommonLoader from "@Components/CommonLoader";
import CustomModal from "@Components/Comon";
import GroupCreateHeader from "../GroupsChats/GroupCreateHeader";
import { Icon } from "react-native-elements";
import ListItemCommon from "@Components/ListItemCommon";
// import RealmContext from "../../../../../schemas";
import { RootState } from "@Store/Reducer";
import Text from "@Components/Text";
import ToastMessage from "@Util/ToastMesage";
import { isEmpty } from "lodash";
import { navigate } from "@Navigation/utility";
import { singleRoom } from "@Atoms/singleRoom";
import { styles } from "./Styles";
import { useAtom } from "jotai";
import { useNavigation } from "@react-navigation/core";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { navigateBack } from "../../../../../navigation/utility";
import { socket } from "@/redux/Reducer/SocketSlice";
import { ChatRoomSettingScreenProps } from "@/navigation/screenPropsTypes";
import { socketConnect } from "@/utils/socket/SocketConnection";
import { socketManager } from "@/utils/socket/SocketManager";
import { produce } from "immer";

const { height } = Dimensions.get("window");

function AddorRemoveParticipants({
  route,
  navigation,
}: ChatRoomSettingScreenProps) {
  const MyProfileData = useSelector((state: RootState) => state.Chat.MyProfile);
  const [display, setDisplay] = useAtom(singleRoom);
  const { comonContact } = useSelector((state: RootState) => state.Contact);
  const [muteModalVisible, setMuteModalVisible] = useState<boolean>(false);
  const [leaveModalVisible, setleaveModalVisible] = useState<boolean>(false);

  const { t } = useTranslation();
  const [removeParticipantRequest, removeParticipantResponse] =
    useRemoveUserFromRoomMutation();
  const [muteRoomRequest, muteRoomResponse] = useMuteRoomMutation();

  const [name, setName] = useState(display.roomName);

  useEffect(() => {
    setName(display.roomName);
  }, [display.roomName]);

  const muteChat = (time: string) => {
    setMuteModalVisible(false);
    muteRoomRequest({
      variables: {
        input: {
          roomId: display.roomId,
          expired_at: time,
        },
      },
    }).then((res) => {
      if (res.data?.muteRoom?.success) {
        ToastMessage(res?.data?.muteRoom.message);
        navigation.goBack();
      }
    });
  };

  const UpdateName = () => {
  const trimmedName = (name || "")
    .trim()
    .replace(/\s+/g, "");

  const existingName = (route.params?.name || "").trim();

  if (isEmpty(trimmedName)) {
    ToastMessage(`${t("toastmessage.please-enter-group-name")}`);
    return;
  }

  if (trimmedName !== existingName) {
    const payload = {
      roomId: display.roomId,
      newName: trimmedName,
      roomType: display?.roomType,
    };

    console.log("Room name changed payload", payload);

    setDisplay(
      produce(display, (draftDisplay) => {
        draftDisplay.roomName = trimmedName;
      })
    );

    socketConnect.emit("setRoomName", payload);

    setTimeout(() => {
      socketManager.chatRoom.fetchAndUpdateRooms();
    }, 1000);
  }

  navigateBack();
};



  const GropListItem = ({
    item,
  }: {
    item: {
      user_id: any;
      firstName: any;
      lastName: any;
      phone: string;
      profile_img: string;
      left_at: string;
    };
  }) => {
    return (
      <>
        {item?.user_id !== MyProfileData._id && (
          <ListItemCommon
            FirstFlex={
              <>
                <AvtaarWithoutTitle
                  ImageSource={{
                    uri: item?.profile_img
                      ? `${DefaultImageUrl}${item?.profile_img}`
                      : `${DefaultImageUrl}${ImageUrl}`,
                  }}
                  AvatarContainerStyle={undefined}
                />
              </>
            }
            SecondFlex={
              <View style={styles.Name}>
                <Text style={styles.participantsName}>
                  {" "}
                  {item.firstName + " " + item.lastName}
                </Text>
                <Text style={styles.phone} size="md">
                  {item.phone}
                </Text>
              </View>
            }
            ThirdFlex={
              <Pressable
                onPress={() => {
                  removeParticipantRequest({
                    variables: {
                      input: {
                        roomId: display.roomId,
                        pid: item.user_id,
                      },
                    },
                  })
                    .then((res) => {
                      if (res.data?.removeUserFromRoom.success) {
                        setDisplay(
                          produce(display, (draftDisplay) => {
                            // Update left_at time for the participant in participants array
                            draftDisplay.participants =
                              display.participants.map((participant) =>
                                participant.user_id === item.user_id
                                  ? { ...participant, left_at: Date.now() }
                                  : participant
                              );

                            // Remove from participantsNotLeft
                            draftDisplay.participantsNotLeft =
                              display.participantsNotLeft?.filter(
                                (el) => el.user_id !== item.user_id
                              );
                          })
                        );
                        socketManager.chatRoom.fetchAndUpdateRooms();
                        // socketManager.chatRoom.fetchAndUpdateRooms();
                        ToastMessage(
                          `${item.firstName + " " + item.lastName} ${t(
                            "toastmessage.successfully-removed-from"
                          )} ${display.roomName}`
                        );
                      }
                    })
                    .catch((er) => {
                      //console.log(er);
                    });
                }}
                style={styles.CheckIconContainer}
              >
                <AntDesign name="closecircle" size={22} color="red" />
              </Pressable>
            }
            // eslint-disable-next-line react-native/no-inline-styles
            ContainerStyle={{
              paddingHorizontal: 0,
              paddingLeft: 20,
              alignItems: "center",
            }}
          />
        )}
      </>
    );
  };

  const goOut = () => {
    removeParticipantRequest({
      variables: {
        input: {
          roomId: display.roomId,
          pid: MyProfileData._id,
        },
      },
    })
      .then((res) => {
        if (res.data?.removeUserFromRoom.success) {
          ToastMessage(`${t("toastmessage.no-longer-part")}`);
          navigate("ChatListScreen");
        }
      })
      .catch((er) => {
        //console.log(er);
      });
  };

  const groupData = useMemo(() => {
    const list = display.participantsNotLeft.filter(
      (pn) => pn.user_id != MyProfileData._id
    );
    console.log(
      "participantsNotLeft data:",
      display.participantsNotLeft.map((el) => {
        return {
          firstName: el.firstName,
          lastName: el.lastName,
          phone: el.phone,
          user_id: el.user_id,
          left_at: el.left_at,
        };
      })
    );
    return list;
  }, [display.participantsNotLeft]);

  return (
    <View style={styles.container}>
      <GroupCreateHeader
        Title={`${display.roomName.slice(0, 15)}${display.roomName.length > 15 ? "..." : ""
          }`}
        navigation={navigation}
        onbackPresss={() => {
          navigation.goBack()
        }}
        secondText={`${display.roomType == "broadcast"
          ? display.participantsNotLeft.filter(
            (e) => e?.user_id != MyProfileData?._id
          ).length
          : display.participantsNotLeft.length
          } ${t("others.members")}`}
      />
      {display.roomPermission.EditInfoPermission?.permit ==
        display.currentUserUtility.user_type || display.isCurrentUserAdmin ? (
        <View style={styles.TopView}>
          <Pressable
            style={styles.avtaarCon}
            onPress={() => {
              navigation.navigate("CreateGroupScreen", {
                mode: "update",
                updateData: {
                  roomId: display.roomId,
                  oldImage: display.roomImage,
                },
              });
            }}
          >
            <View>
              <AvtaarWithoutTitle
                ImageSource={{ uri: `${DefaultImageUrl}${display.roomImage}` }}
                AvatarContainerStyle={styles.TopImage}
              />
              <View style={styles.EditImageCon}>
                <Icon name="edit" color="white" size={15} />
              </View>
            </View>
          </Pressable>
          <AnimatedTextInput
            text={t("create-user-group.Name")}
            value={name}
            onChangeText={(e: string) => {
              setName(e);
            }}
            UpdateName={() => UpdateName()}
            Edit
          />
        </View>
      ) : null}

      {display.isCurrentUserAdmin && (
        <View
          style={{
            backgroundColor: "white",
            marginTop: 15,
            height: Dimensions.get("screen").height - 300,
          }}
        >
          <View style={[styles.memberAddCon, { marginHorizontal: 20 }]}>
            <Text style={{ fontSize: 15, fontWeight: "500", color: "gray" }}>
              {t("membersOfGroup")}
            </Text>
            <Pressable
              style={styles.addMemberCon}
              onPress={() =>
                navigate("EditChatParticipantScreen", {
                  name: display.roomName,
                  AlreadyAdded: display.participants.filter(
                    (pr) => pr.user_id != MyProfileData._id
                  ),
                  GroupImage: display.roomImage,
                })
              }
            >
              {/* <Icon name="add" color="white" style={{ paddingRight: 10 }} /> */}

              <Text
                style={{ color: Colors.light.White, fontSize: 14 }}
                size="md"
              >
                {t("addMember")}
              </Text>
            </Pressable>
          </View>
          {/* <View style={{height:'78%'}}> */}
          <FlatList
            style={{ flex: 1, marginTop: 10 }}
            contentContainerStyle={{}}
            data={groupData}
            renderItem={({ item }) => {
              console.log("list user: ", item.firstName);
              const a = comonContact.filter(
                (it) => item.user_id == it.userId?._id
              );
              const itemObject =
                a.length > 0
                  ? {
                    user_id: a[0].userId?._id,
                    firstName: a[0].firstName,
                    lastName: a[0].lastName,
                    phone: a[0].phone,
                    profile_img: a[0].userId?.profile_img,
                    left_at: a[0].lastSeen,
                  }
                  : { ...item, firstName: item.phone, lastName: "" };
              // //console.log(a);
              return <GropListItem item={itemObject} />;
            }}
            ListEmptyComponent={
              <View
                style={{
                  height: height / 2,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "rgba(51,51,51,.4)", textAlign: "center" }}
                >
                  {t("noMember")}
                </Text>
              </View>
            }
          />
          {/* </View> */}
        </View>
      )}

      <CustomModal
        title={`Leave group ${name}`}
        modalVisible={leaveModalVisible}
        setModalVisible={setleaveModalVisible}
        customButtons={[
          { title: "Go Out", onPress: () => goOut() },

          {
            title: "Mute Chat?",
            onPress: () => {
              setleaveModalVisible(false);
              setTimeout(() => {
                setMuteModalVisible(true);
              }, 500);
            },
            buttonColor: Colors.light.red,
          },
        ]}
      />
      <CustomModal
        modalVisible={muteModalVisible}
        setModalVisible={setMuteModalVisible}
        customButtons={[
          { title: "8 Hours", onPress: () => muteChat("8h") },
          { title: "1 Week", onPress: () => muteChat("1w") },
          { title: "Always", onPress: () => muteChat("always") },
        ]}
      />
      {removeParticipantResponse.loading && <CommonLoader />}
    </View>
  );
}

export default AddorRemoveParticipants;
