import * as React from "react";

import { Alert, Pressable, StyleSheet, View } from "react-native";
import { RoomData, RoomParticipantData } from "@Store/Models/ChatModel";
import { cloneDeep, find, isEmpty, some, sumBy } from "lodash";
import {
  useArchiveRoomMutation,
  useDeleteRoomMutation,
  useFixRoomMutation,
  useMuteRoomMutation,
  useUnArchiveRoomMutation,
  useUnfixRoomMutation,
  useUnmuteRoomMutation,
} from "@Service/generated/room.generated";
import { useDispatch, useSelector } from "react-redux";

import { AllChatRooms, ArchiveRoomsAtom, FolderAndTabsAtom } from "@Atoms/allRoomsAtom";
import Colors from "@/Constants/Colors";
import CustomModal from "@Components/Comon";
import CustomModal2 from "@Components/customFolder2";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import More from "@Images/More.svg";
import { RootState } from "@Store/Reducer/index";
import Text from "@Components/Text";
import ToastMessage from "@Util/ToastMesage";
import UnRead from "@Images/UnRead.svg";
import isActiveAction from "@Util/helpers/isActionActive";
import { navigate } from "@Navigation/utility";
import { produce } from "immer";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import useFileSystem from "@Hooks/useFileSystem";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/redux/Store";
import { socketManager } from "@/utils/socket/SocketManager";
import { socketConnect } from "@/utils/socket/SocketConnection";

interface HiddenItemProps {
  data?: { item: RoomData };
  rowMap?: {};
  HiddenBtnRightTextFirst?: string;
  Btnstyle?: {};
  isArchive?: string;
  onPressArchive?: () => {};
  isPin?: boolean;
  BtnRightContainerStyle?: {};
  navigation: { navigate: {} };
}
const closeRow = (rowMap: {} | undefined, rowKey: string) => {
  // //console.log(rowMap[rowKey]);
  if (rowMap[rowKey]) {
    rowMap[rowKey].closeRow();
  }
};

function HiddenItem({
  data,
  rowMap,
  HiddenBtnRightTextFirst,
  Btnstyle,
  BtnRightContainerStyle,
  isArchive,
  navigation,
  onPressArchive,
}: HiddenItemProps) {
  const getActionUserId = React.useCallback((entry: any) => {
    const uid = entry?.user_id;
    if (typeof uid === "string") return uid;
    if (uid && typeof uid === "object") return uid?._id || uid?.id || "";
    const altUserId = entry?.userId;
    if (typeof altUserId === "string") return altUserId;
    if (altUserId && typeof altUserId === "object") return altUserId?._id || altUserId?.id || "";
    if (typeof entry?.pid === "string") return entry.pid;
    if (typeof entry?._id === "string") return entry._id;
    return "";
  }, []);

  const [ShowmoreModal, setshowMoreModal] = React.useState<boolean>(false);
  const [selectedItem, setSelectedItem] = React.useState<RoomData>(
    {} as RoomData
  );
  const MyProfile = useAppSelector((state) => state.Chat.MyProfile);
  const [muteModalVisible, setMuteModalVisible] =
    React.useState<boolean>(false);
  const [chatdeleteconfirm, setchatdeleteconfirm] =
    React.useState<boolean>(false);
  const [AllRooms, setAllRooms] = useAtom(AllChatRooms);
  const setArchiveRooms = useSetAtom(ArchiveRoomsAtom);
  const [display, setDisplay] = useAtom(singleRoom);
  const currentTab = useAtomValue(FolderAndTabsAtom);

  const { exportChat } = useFileSystem();
  const [clearChatVsible, setClearChatVisible] = React.useState<boolean>(false);
  const [pinRoomRequest, pinRoomResponse] = useFixRoomMutation();
  const [unPinRoomRequest, unPinRoomResponse] = useUnfixRoomMutation();
  const [archiveRoomRequest, archiveRoomResponse] = useArchiveRoomMutation();
  const [deleteRoomRequest, deleteRoomResponse] = useDeleteRoomMutation();

  const [muteRoomRequest] = useMuteRoomMutation();
  const [unMuteRoomRequest] = useUnmuteRoomMutation();
  const { t } = useTranslation();

  const isMuted = React.useMemo(() => {
    const muted =
      data?.item?.mutedBy.findIndex(
        (one: any) => one.user_id === MyProfile?._id
      ) !== -1;

    return muted;
  }, [data]);

  const MoreOptions = React.useMemo(() => {
    let options = [];
    options = [
      {
        title: isMuted
          ? `${t("chatProfile.unmute")}`
          : `${t("chatProfile.mute")}`,
        onPress: () => {
          setshowMoreModal(false);
          setTimeout(() => {
            isMuted ? unMuteChat() : setMuteModalVisible(true);
          }, 500);
        },
      },
      {
        title: `${t("chatProfile.clear-chat")}`,
        onPress: () => {
          setshowMoreModal(false);
          setTimeout(() => {
            setClearChatVisible(true);
          }, 500);
        },
        buttonColor: Colors.light.red,
      },
      {
        title: `${t("chatProfile.delete-chat")}`,
        onPress: () => {
          setshowMoreModal(false);
          setTimeout(() => {
            setchatdeleteconfirm(true);
          }, 800);
        },
        buttonColor: Colors.light.red,
      },
    ];

    if (currentTab > 0 && isArchive == "archiveRoom") {
      options.push({
        title: "Remove from folder",
        onPress: () => {
          setshowMoreModal(false);
          removeFromFolder(selectedItem?._id);
        },
        buttonColor: Colors.light.red,
      });
    }

    return options;
  }, [currentTab, selectedItem, isArchive, isMuted]);

  const pinChat = (time: string) => {
    const roomId = data?.item._id ?? ''
    pinRoomRequest({
      variables: {
        input: {
          roomId
        },
      },
    }).then((res) => {
      if (res.data?.fixRoom.success) {
        socketManager.chatRoom.fetchAndUpdateRooms((data: { rooms: RoomData[] }) => {
          if (data) {
            const rooms = produce(AllRooms, (draftrooms) => {
              return draftrooms.map((dr) => {
                if (dr._id == roomId) {
                  const updatedRoom = data.rooms.find(room => room._id === roomId);
                  return {
                    ...dr,
                    fixedBy: updatedRoom?.fixedBy || dr.fixedBy,
                  };
                } else {
                  return dr;
                }
              });
            });
            setAllRooms(rooms);
          }
        });
        setMuteModalVisible(false);
        ToastMessage(`${t("toastmessage.pinChat")}`);
      }
    });
  };

  const unPinChat = () => {
    const roomId = data?.item._id ?? ''
    unPinRoomRequest({
      variables: {
        input: {
          roomId
        },
      },
    }).then((res) => {
      if (res.data?.unfixRoom.success) {
        socketManager.chatRoom.fetchAndUpdateRooms((data: { rooms: RoomData[] }) => {
          if (data) {
            const rooms = produce(AllRooms, (draftrooms) => {
              return draftrooms.map((dr) => {
                if (dr._id == roomId) {
                  const updatedRoom = data.rooms.find(room => room._id === roomId);
                  return {
                    ...dr,
                    fixedBy: updatedRoom?.fixedBy || dr.fixedBy,
                  };
                } else {
                  return dr;
                }
              });
            });
            setAllRooms(rooms);
          }
        });
        // socketConnect.emit("GetAllRooms", {});
        ToastMessage(`${t("toastmessage.unPinChat")}`);
      }
    });

  };

  const muteChat = (time: string) => {
    muteRoomRequest({
      variables: {
        input: {
          roomId: data?.item?._id,
          expired_at: time,
        },
      },
    }).then((res) => {
      if (res.data?.muteRoom?.success) {
        // socketConnect.emit("GetAllRooms", {});
        socketManager.chatRoom.fetchAndUpdateRooms((data: { rooms: RoomData[] }) => {
          if (data) {
            const rooms = produce(AllRooms, (draftrooms) => {
              return draftrooms.map((dr) => {
                if (dr._id == selectedItem._id) {
                  const updatedRoom = data.rooms.find(room => room._id === selectedItem._id);
                  return {
                    ...dr,
                    mutedBy: updatedRoom?.mutedBy || dr.mutedBy,
                  };
                } else {
                  return dr;
                }
              });
            });
            setAllRooms(rooms);
          }
        });
        setMuteModalVisible(false);
      }
    });

  };

  const unMuteChat = () => {
    unMuteRoomRequest({
      variables: {
        input: {
          roomId: data?.item._id,
        },
      },
    }).then((res) => {
      if (res.data?.unmuteRoom?.success) {
        // socketConnect.emit("GetAllRooms", {});
        socketManager.chatRoom.fetchAndUpdateRooms((data: { rooms: RoomData[] }) => {
          if (data) {
            const rooms = produce(AllRooms, (draftrooms) => {
              return draftrooms.map((dr) => {
                if (dr._id == selectedItem._id) {
                  const updatedRoom = data.rooms.find(room => room._id === selectedItem._id);
                  return {
                    ...dr,
                    mutedBy: updatedRoom?.mutedBy || dr.mutedBy,
                  };
                } else {
                  return dr;
                }
              });
            });
            setAllRooms(rooms);
          }
        });
        setMuteModalVisible(false);
      }
    });
  };


  const ClearChat = () => {
    socketManager.conversation.clearAllChat({ roomId: display.roomId });
    // socket.emit("clearAllChats", { roomId: selectedItem._id });
    setClearChatVisible(false);
    socketConnect.emit("clearAllChats", { roomId: selectedItem._id });
  };

  function removeFromFolder(_id: string) {
    if (currentTab > 0) {
      let currentFolder = MyProfile.folders[currentTab - 1];
      let updatedRoom = currentFolder.roomId.filter((v) => v !== _id);
      socketConnect.emit("editFolder", {
        folderId: currentFolder._id,
        newName: currentFolder.name,
        rooms: updatedRoom,
      });
    }
  }

  const currentRoomForUnreadAction = React.useMemo(() => {
    const roomId = data?.item?._id;
    return (AllRooms || []).find((room: RoomData) => room?._id === roomId) || data?.item;
  }, [AllRooms, data?.item]);

  const unreadActionState = React.useMemo(() => {
    const unreadCount =
      typeof currentRoomForUnreadAction?.unread === "number"
        ? currentRoomForUnreadAction.unread
        : (currentRoomForUnreadAction?.participants || []).find((participant: any) => {
            const uid = participant?.user_id;
            const normalizedUserId =
              typeof uid === "string" ? uid : uid?._id || uid?.id || "";
            return normalizedUserId === MyProfile?._id;
          })?.unread_cid?.length || 0;

    const hasUnreadMarker = (currentRoomForUnreadAction?.unreadBy || []).some(
      (entry: any) => getActionUserId(entry) === MyProfile?._id
    );

    return {
      unreadCount,
      hasUnreadCount: unreadCount > 0,
      hasUnreadMarker,
    };
  }, [currentRoomForUnreadAction, MyProfile?._id, getActionUserId]);

  const buildArchiveListForMe = React.useCallback(
    (rooms: RoomData[]) => {
      return (rooms || []).filter((room) =>
        (room?.archivedBy || []).some(
          (entry: any) => getActionUserId(entry) === MyProfile?._id
        )
      );
    },
    [MyProfile?._id, getActionUserId]
  );

  return (
    <>
      <View style={Styles.HiddenTabContainer}>
        <Pressable
          onPress={() => {
            const roomItem = data?.item;
            const roomId = roomItem?._id;
            const hasUnread = unreadActionState.hasUnreadCount;

            if (!roomId) {
              closeRow(rowMap, data?.item._id);
              return;
            }

            if (roomItem?.type === "broadcast" || (roomItem?.totalChats ?? 0) === 0) {
              closeRow(rowMap, data?.item._id);
              return;
            }

            if (hasUnread) {
              socketConnect.emit("setChatReadBy", { roomId, cid: [] });
            } else {
              socketConnect.emit("markRoomUnread", { roomId });
            }

            // Local instant toggle for WhatsApp-like manual unread dot.
            const optimisticRooms = produce(AllRooms || [], (draftrooms) => {
              return draftrooms.map((dr) => {
                if (dr._id !== roomId) return dr;

                const unreadBy = Array.isArray(dr?.unreadBy) ? [...dr.unreadBy] : [];
                const myEntryIndex = unreadBy.findIndex(
                  (entry: any) => getActionUserId(entry) === MyProfile?._id
                );

                if (hasUnread) {
                  if (myEntryIndex !== -1) unreadBy.splice(myEntryIndex, 1);
                } else if (myEntryIndex === -1) {
                  unreadBy.push({ user_id: MyProfile?._id, time: Date.now() });
                }

                return { ...dr, unreadBy };
              });
            });
            setAllRooms(optimisticRooms);

            setTimeout(() => {
              socketManager.chatRoom.fetchAndUpdateRooms((data: { rooms: RoomData[] }) => {
                if (data?.rooms) {
                  setAllRooms(data.rooms);
                }
              }
              );
            }, 1000);
            closeRow(rowMap, data?.item._id);
          }}
          style={[
            {
              backgroundColor: Colors.light.blue,
              width: 70,
              height: 100,
              justifyContent: "center",
              alignItems: "center",
            },
            Btnstyle,
          ]}
        >
          <UnRead />
          <Text style={[Styles.HiddenTextcolor, { color: "white" }]}>
            {unreadActionState.hasUnreadCount ? "Read" : "Unread"}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            const howManyPinAlready = sumBy(AllRooms, (item) => {
              return some(item.fixedBy, { user_id: MyProfile?._id }) ? 1 : 0;
            });
            closeRow(rowMap, data?.item._id);
            const AlreadyPined = find(data?.item.fixedBy, {
              user_id: MyProfile?._id,
            });
            if (AlreadyPined) {
              unPinChat();
            } else {
              if (howManyPinAlready < 3) {
                pinChat("");
              } else {
                ToastMessage(`${t("toastmessage.pinChat-worning")}`);
              }
            }
          }}
          style={[
            {
              backgroundColor: "rgba(51,51,51,.1)",
              width: 70,
              height: 100,
              justifyContent: "center",
              alignItems: "center",
            },
            Btnstyle,
          ]}
        >
          {/* <PinWithOutBackground /> */}
          <MaterialIcons name="push-pin" size={28} color="black" />
          <Text
            style={
              (Styles.HiddenTextcolor,
                { color: "black", fontSize: 13, marginTop: 4 })
            }
          >
            {!isActiveAction(data?.item.fixedBy, MyProfile?._id)
              ? `${t("Hidden-Files.pin")}`
              : `${t("Hidden-Files.unpin")}`}
          </Text>
        </Pressable>
      </View>
      <View
        style={[
          Styles.HiddenTabContainer,
          { right: -60 },
          BtnRightContainerStyle,
        ]}
      >
        <Pressable
          onPress={() => {
            closeRow(rowMap, data?.item._id);
            const roomId = data?.item?._id;

            if (isArchive && isArchive.length > 0 && onPressArchive) {
              onPressArchive();
              return;
            } else {
              try {
                if (!roomId) return;
                archiveRoomRequest({
                  variables: {
                    input: {
                      roomId,
                    },
                  },
                }).then((res) => {
                  if (res.data?.archiveRoom.success) {
                    const nextRooms = produce(AllRooms || [], (draftrooms) => {
                      return draftrooms.map((dr) => {
                        if (dr._id !== roomId) return dr;
                        const archivedBy = Array.isArray(dr?.archivedBy)
                          ? [...dr.archivedBy]
                          : [];
                        const alreadyArchived = archivedBy.some(
                          (entry: any) =>
                            getActionUserId(entry) === MyProfile?._id
                        );
                        if (!alreadyArchived) {
                          archivedBy.push({
                            user_id: MyProfile?._id,
                            time: Date.now(),
                          });
                        }
                        return { ...dr, archivedBy, isArchived: true };
                      });
                    });
                    setAllRooms(nextRooms);
                    setArchiveRooms(buildArchiveListForMe(nextRooms));

                    socketManager.chatRoom.fetchAndUpdateRooms((data: { rooms: RoomData[] }) => {
                      if (data) {
                        setAllRooms(data.rooms);
                        setArchiveRooms(buildArchiveListForMe(data.rooms));
                      }
                    }
                    );
                    // socketConnect.emit("GetAllRooms", {});
                    ToastMessage(`${t("toastmessage.archive-message")}`);
                  }
                });
              } catch (error) {
                console.log(error);
              }
            }
          }}
          style={[
            {
              backgroundColor: "rgba(51,51,51,.1)",

              width: 70,
              height: 100,
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 5,
            },
            Btnstyle,
          ]}
        >
          <Ionicons name="archive-outline" size={24} />
          {/* <Archive style={{ marginBottom: 4 }} /> */}
          <Text style={Styles.HiddenTextcolor}>
            {" "}
            {HiddenBtnRightTextFirst
              ? HiddenBtnRightTextFirst
              : `${t("Hidden-Files.archive")}`}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            closeRow(rowMap, data?.item._id);
            setshowMoreModal(true);
            setSelectedItem(data?.item);
          }}
          style={[Styles.MoreBtnStyle, Btnstyle]}
        >
          <More style={{ marginBottom: 10 }} />
          <Text style={[Styles.HiddenTextcolor, { color: "white" }]}>
            {t("Hidden-Files.more")}
          </Text>
        </Pressable>

        <CustomModal
          modalVisible={ShowmoreModal}
          setModalVisible={setshowMoreModal}
          customButtons={MoreOptions}
        />
        <CustomModal2
          modalVisible={chatdeleteconfirm}
          title={t("btn.delete")}
          setModalVisible={setchatdeleteconfirm}
          positiveButton={() => {
            setchatdeleteconfirm(false);
            const rooms = produce(AllRooms, (draftrooms) => {
              return draftrooms.filter((dr) => dr._id != selectedItem._id);
            });
            setAllRooms(rooms);
            deleteRoomRequest({
              variables: {
                input: {
                  roomId: selectedItem._id,
                },
              },
            }).then(() => {
              // socketConnect.emit("GetAllRooms", {});
              socketManager.chatRoom.fetchAndUpdateRooms((data: { rooms: RoomData[] }) => {
                if (data) {
                  const rooms = produce(AllRooms, (draftrooms) => {
                    return draftrooms.filter((dr) => dr._id != selectedItem._id);
                  });
                  setAllRooms(rooms);
                }
              }
              );
              ToastMessage(`${t("toastmessage.room-deleted-successfully")}`);
            });
            socketConnect.emit("deleteRoom", { roomId: selectedItem._id });
          }}
        // negativeButton={() => {}}
        />
        <CustomModal
          modalVisible={muteModalVisible}
          setModalVisible={setMuteModalVisible}
          customButtons={[
            {
              title: `8 ${t("profile-mute-modals.hours")}`,
              onPress: () => muteChat("8h"),
            },
            {
              title: `1 ${t("profile-mute-modals.Week")}`,
              onPress: () => muteChat("1w"),
            },
            {
              title: `${t("profile-mute-modals.always")}`,
              onPress: () => muteChat("always"),
            },
          ]}
        />
        <CustomModal
          modalVisible={clearChatVsible}
          setModalVisible={setClearChatVisible}
          titleStyle={{ color: Colors.light.Hiddengray }}
          title={t("profile-clearchat-modal.delete-messages")}
          customButtons={[
            {
              title: `${t("profile-clearchat-modal.clear-all-messages")}`,
              onPress: () => ClearChat(),
              buttonColor: Colors.light.red,
            },
          ]}
        />
      </View>
    </>
  );
}

// define your styles
const Styles = StyleSheet.create({
  HiddenTabContainer: {
    flexDirection: "row",
    position: "absolute",
    width: 200,
  },
  HiddenTextcolor: {
    color: "black",
    fontSize: 13,
    marginBottom: 20,
    marginTop: 4,
  },
  MoreBtnStyle: {
    alignItems: "center",
    backgroundColor: Colors.light.blue,
    height: 100,
    justifyContent: "center",
    paddingTop: 10,
    width: 70,
  },
});

//make this component available to the app
export default HiddenItem;
