import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { chatMode, chatSearchEnabledAtom } from "@Atoms/ChatMessageEvents";
import { useAtom, useSetAtom } from "jotai";
import { useSelector } from "react-redux";

// Custom hooks
import useRoomMedia from "@/hooks/useRoomMedia";
import useRoomActions from "@/hooks/useRoomActions";
import useUserStatus from "@/hooks/useUserStatus";
import useRoomPermissions from "@/hooks/useRoomPermissions";

// Components
import SelectGrupHeader from "../ChatFolderContainer/CreateFolderScreen/Header";
import Text from "@Components/Text";
import ProfileImage from "./ProfileImage";
import CustomModal from "@Components/Comon";
import CommonLoader from "@Components/CommonLoader";
import ReportUser from "./ReportUser";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import SettingsOptions from "./components/SettingsOptions";

// Utils
import { DefaultImageUrl } from "@Service/provider/endpoints";
import { navigate } from "@Navigation/utility";
import { singleRoom } from "@Atoms/singleRoom";
import ToastMessage from "@Util/ToastMesage";
import { useAppSelector } from "@/redux/Store";
import Colors from "@/Constants/Colors";
import { fonts } from "@/Constants";
import GroupListItem from "./GroupListItem";
import OnlineReminder from "./OnlineReminder";
import { createStorage } from "@/utils/mmkvStorage";
import useFileSystem from "@/hooks/useFileSystem";
import { getChatProfileActionVisibility } from "./chatProfileActions";

const chatMessageStorage = createStorage({
  id: "chatmessages",
});

export default function ProfileInfo({ navigation, route }) {
  const { t } = useTranslation();

  // Global state
  const [display, setDisplay] = useAtom(singleRoom);
  const MyProfileData = useAppSelector((state) => state.Chat.MyProfile);
  const contacts = useAppSelector((state) => state.Contact.contacts);
  const FavoriteChat = useSelector((state) => state.Chat.GetFavoriteChat);
  const setChatmode = useSetAtom(chatMode);
  const setSearchEnable = useSetAtom(chatSearchEnabledAtom);
  const { exportChat } = useFileSystem();

  // Check if the room is a broadcast
  const isBroadcastRoom = useMemo(
    () => display?.roomType === "broadcast",
    [display?.roomType]
  );

  const resolvedRoomName = useMemo(() => {
    if (display?.roomType !== "individual") return display.roomName;
    const otherParticipant = display.participants?.find(
      (p) => p.user_id !== MyProfileData?._id
    );
    if (!otherParticipant) return display.roomName;

    const found = contacts.find((c) => c.userId?._id === otherParticipant.user_id);
    if (found) {
      const fullName = `${found.firstName ?? ""} ${found.lastName ?? ""}`.trim();
      if (fullName) return fullName;
    }

    const participantName = `${otherParticipant.firstName ?? ""} ${otherParticipant.lastName ?? ""}`.trim();
    return participantName || display.roomName;
  }, [display, contacts, MyProfileData?._id]);

  // Custom hooks
  // const { mediaCount } = useRoomMedia({
  //   roomId: display.roomId,
  //   userId: MyProfileData?._id
  // });

  const {
    // Modal states
    muteModalVisible,
    setMuteModalVisible,
    clearChatVisible,
    setClearChatVisible,
    blockVisible,
    setBlockVisible,
    camerarollVisible,
    setCamerarollVisible,
    reportVisible,
    setReportVisible,
    leaveModalVisible,
    setLeaveModalVisible,
    unmuteModalVisible,
    setUnmuteModalVisible,
    deleteBroadcastVisible,
    setDeleteBroadcastVisible,
    deleteBroadcastLoader,

    // Actions
    muteChat,
    unmuteChat: unmute,
    clearChat,
    handleCameraRollSetting,
    handleBroadcastListDelete,
    blockUser,
    unblockUser,
    reportUser: reportUserWithReason,
    leaveGroup,
    deleteChat: deleteSpecificRoomData,

    // Loading states
    deleteRoomLoading,
    removeParticipantLoading,
  } = useRoomActions({
    roomId: display.roomId,
    roomName: resolvedRoomName,
    profileId: MyProfileData?._id,
  });

  // User status hook
  const { lastSeen, isReminder } = useUserStatus({
    roomType: display.roomType,
    participants: display.participants,
    myProfileId: MyProfileData?._id,
    roomStatus: display.roomStatus,
    contactReminders: MyProfileData?.contact_reminder,
  });

  // // Permissions hook
  const { canEditGroupInfo } = useRoomPermissions({
    roomType: display.roomType,
    roomPermissions: display.roomPermission,
    currentUserRole: display.currentUserUtility.user_type,
    hasLeftRoom: display.currentUserUtility.left_at > 0,
    participantCount: display.participantsNotLeft?.length,
  });

  /**
   * Handle camera roll setting with update to display state
   */
  const handleCameraRollSettingWithUpdate = useCallback(
    (_type: "On" | "Off") => {
      const isActive = handleCameraRollSetting(_type);
      setDisplay({
        ...display,
        isCurrentRoomSavetoCameraRollActive: isActive,
      });
    },
    [display, setDisplay, handleCameraRollSetting]
  );

  /**
   * Handle unblock user with profile data
   */
  const handleUnblockUser = useCallback(() => {
    unblockUser(MyProfileData);
  }, [unblockUser, MyProfileData]);

  // console.log("MyProfileData: ",MyProfileData)

  /**
   * Report user with feedback
   */
  const handleReportUser = useCallback(
    (reason: string) => {
      setReportVisible(false);
      ToastMessage(`${t("toastmessage.user-blocked-successfully")}`);
      reportUserWithReason(reason);
    },
    [reportUserWithReason, t]
  );


  const handleExportChat = useCallback(async () => {
    try {
      const chats = chatMessageStorage.getString("conversations_" + display.roomId);
      const messages = chats ? JSON.parse(chats) : [];
      await exportChat(
        {
          type: display.roomType,
          name: display.roomName,
          participants: display.participants,
        },
        messages
      );
    } catch (error) {
      console.log("Error exporting chat:", error);
      ToastMessage(t("errors.error"));
    }
  }, [display, exportChat, t]);

  /**
   * Handle leave then mute
   */
  const handleLeaveAndMute = useCallback(() => {
    setLeaveModalVisible(false);
    setTimeout(() => {
      setMuteModalVisible(true);
    }, 300);
  }, []);

  /**
   * Bottom text component for actions
   */
  const BottomText = useCallback(({ Title, TextColor, onPress }) => {
    return (
      <Pressable onPress={onPress}>
        <Text
          style={{
            marginHorizontal: 20,
            marginVertical: 15,
            fontFamily: "Lato",
            color: TextColor || "black",
          }}
        >
          {Title}
        </Text>
      </Pressable>
    );
  }, []);

  // Check if user is blocked
  const isUserBlocked = useMemo(() => {
    return (
      MyProfileData?.blockedRooms?.findIndex(
        (item) => item.room_Id == display.roomId
      ) !== -1
    );
  }, [MyProfileData, display.roomId]);

  const actionVisibility = useMemo(
    () =>
      getChatProfileActionVisibility({
        roomType: display.roomType,
        isBroadcastRoom,
        hasLeftRoom: display.currentUserUtility.left_at != 0,
        isCurrentRoomBlocked: !!display.isCurrentRoomBlocked,
      }),
    [display, isBroadcastRoom]
  );

  return (
    <>
      <SelectGrupHeader
        isEdit={canEditGroupInfo}
        Title={t("navigation.contact-info")}
        onbackPresss={navigation.goBack}
        onEdit={() => {
          if (canEditGroupInfo) {
            navigate("ChatRoomSettingScreen", {
              name: resolvedRoomName,
              GroupImage: display.roomImage,
            });
          }
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[styles.container, { backgroundColor: "rgba(243,243,243,1)" }]}
        contentContainerStyle={styles.scrollView}
      >
        {/* Profile Image Section */}
        <ProfileImage
          hasPermission={canEditGroupInfo}
          lastSeen={lastSeen}
          isBroadcastRoom={isBroadcastRoom}
        />

        <View style={{ marginTop: 10 }}>
          {/* Settings Options Section */}
          <SettingsOptions
            display={display}
            mediaCount={display.totalMedia ?? 0}
            setChatmode={setChatmode}
            setSearchEnable={setSearchEnable}
            setMuteModalVisible={setMuteModalVisible}
            setUnmuteModalVisible={setUnmuteModalVisible}
            setcamerarollVisible={setCamerarollVisible}
            isBroadcastRoom={isBroadcastRoom}
            FavoriteChat={FavoriteChat}
            MyProfile={MyProfileData}
            isReminder={isReminder}
          />

          {/* Online Reminder Component */}
          <OnlineReminder isReminder={isReminder} />

          {/* Group Participants */}
          {(display.roomType == "group" || isBroadcastRoom) && (
            <GroupListItem
              navigation={navigation}
              name={resolvedRoomName}
              GroupImage={`${DefaultImageUrl}${display.roomImage}`}
            />
          )}

          {/* Bottom Actions Section */}
          <View
            style={{
              marginTop: 10,
              backgroundColor: "white",
              paddingVertical: 10,
            }}
          >
            {/* Share Contact Action */}
            {actionVisibility.showShareContact && (
              <BottomText
                Title={t("chatProfile.share-Contact")}
                onPress={() => {
                  navigate("SelectChatRoomScreen", {
                    sourceRoomId: display.roomId,
                    goBackDepth: 2,
                  });
                }}
              />
            )}

            {/* Export Chat */}
            {actionVisibility.showExportChat && (
              <BottomText
                Title={t("chatProfile.export-chat")}
                onPress={handleExportChat}
              />
            )}

            {/* Delete Chat (For users who left) */}
            {display.currentUserUtility.left_at != 0 && (
              <BottomText
                Title={t("chatProfile.delete-chat")}
                TextColor={Colors.light.red}
                onPress={deleteSpecificRoomData}
              />
            )}

            {/* Clear Chat (For active users) */}
            {actionVisibility.showClearChat && (
              <BottomText
                Title={t("chatProfile.clear-chat")}
                TextColor={Colors.light.red}
                onPress={() => {
                  setClearChatVisible(true);
                }}
              />
            )}

            {/* Block/Unblock Contact */}
            {actionVisibility.showBlockOrUnblock && (
              <BottomText
                Title={
                  isUserBlocked
                    ? t("chatProfile.unblock-contact")
                    : t("chatProfile.block-contact")
                }
                TextColor={Colors.light.red}
                onPress={() => {
                  setBlockVisible(true);
                }}
              />
            )}

            {/* Report Contact */}
            {actionVisibility.showReportContact && (
              <BottomText
                Title={t("chatProfile.report-contact")}
                TextColor={Colors.light.red}
                onPress={() => setReportVisible(true)}
              />
            )}

            {/* Leave Group */}
            {actionVisibility.showLeaveGroup && (
                <Pressable
                  style={styles.LeaveGroupCon}
                  onPress={() => {
                    setLeaveModalVisible(true);
                  }}
                >
                  <Text style={styles.LeavGroupText}>
                    {t("btn.Leave-Group")}
                  </Text>
                </Pressable>
              )}
          </View>
        </View>

        {/* Delete Broadcast Option */}
        {isBroadcastRoom && (
          <View style={{ backgroundColor: "white", marginTop: 10 }}>
            <TouchableOpacity
              style={[
                styles.rowDirection,
                { padding: 10, marginHorizontal: 7, alignItems: "center" },
              ]}
              onPress={() => {
                setDeleteBroadcastVisible(!deleteBroadcastVisible);
              }}
            >
              <MaterialCommunityIcons name="delete" size={25} color={"red"} />
              <Text style={[styles.textStyle, styles.textTypo]}>
                {t("deleteBroadcast")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Modals */}
        {/* Mute Modal */}
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

        {/* Clear Chat Modal */}
        <CustomModal
          modalVisible={clearChatVisible}
          setModalVisible={setClearChatVisible}
          titleStyle={{ color: Colors.light.Hiddengray }}
          title={t("profile-clearchat-modal.delete-messages")}
          customButtons={[
            {
              title: `${t("profile-clearchat-modal.clear-all-messages")}`,
              onPress: clearChat,
              buttonColor: Colors.light.red,
            },
          ]}
        />

        {/* Block/Unblock Modal */}
        {!isUserBlocked ? (
          <CustomModal
            modalVisible={blockVisible}
            setModalVisible={setBlockVisible}
            titleStyle={{ color: Colors.light.Hiddengray }}
            title={t("block-contact.block-description")}
            customButtons={[
              {
                title: `${t("profile-report-modal.block")}`,
                onPress: blockUser,
                buttonColor: Colors.light.red,
              },
            ]}
          />
        ) : (
          <CustomModal
            modalVisible={blockVisible}
            setModalVisible={setBlockVisible}
            titleStyle={{ color: Colors.light.Hiddengray }}
            title={t("block-contact.unblock-description")}
            customButtons={[
              {
                title: `${t("profile-report-modal.unblock")}`,
                onPress: handleUnblockUser,
                buttonColor: Colors.light.red,
              },
            ]}
          />
        )}

        {/* Camera Roll Modal */}
        <CustomModal
          modalVisible={camerarollVisible}
          setModalVisible={setCamerarollVisible}
          titleStyle={{ color: Colors.light.Hiddengray }}
          title={t("chatProfile.save-to-camera")}
          customButtons={[
            {
              title: `${t("chatProfile.on")}`,
              disabled: false,
              onPress: () => handleCameraRollSettingWithUpdate("On"),
            },
            {
              title: `${t("chatProfile.off")}`,
              disabled: false,
              onPress: () => handleCameraRollSettingWithUpdate("Off"),
            },
          ]}
        />

        {/* Report User Modal */}
        <ReportUser
          isVisible={reportVisible}
          onCancel={() => setReportVisible(false)}
          onReport={handleReportUser}
        />

        {/* Delete Broadcast Modal */}
        <CustomModal
          title={t("deleteBroadcastAction")}
          modalVisible={deleteBroadcastVisible}
          setModalVisible={setDeleteBroadcastVisible}
          disableCancelButton={deleteBroadcastLoader}
          customButtons={[
            {
              title: deleteBroadcastLoader ? (
                <ActivityIndicator
                  size={20}
                  color={Colors.light.PrimaryColor}
                />
              ) : (
                t("btn.delete")
              ),
              onPress: handleBroadcastListDelete,
              buttonColor: "red",
            },
          ]}
        />

        {/* Unmute Modal */}
        <CustomModal
          title={t("unmuteNotification")}
          modalVisible={unmuteModalVisible}
          setModalVisible={setUnmuteModalVisible}
          disableCancelButton={deleteBroadcastLoader}
          customButtons={[
            {
              title: t("chatProfile.unmute"),
              onPress: unmute,
            },
          ]}
        />

        {/* Leave Group Modal */}
        <CustomModal
          title={`${t("btn.Leave-Group")} ${resolvedRoomName}`}
          modalVisible={leaveModalVisible}
          setModalVisible={setLeaveModalVisible}
          customButtons={[
            {
              title: `${t("Leave-Group.go-out")}`,
              onPress: leaveGroup,
            },
            {
              title: `${t("Leave-Group.mute-chat")}`,
              onPress: handleLeaveAndMute,
              buttonColor: Colors.light.red,
            },
          ]}
        />
      </ScrollView>

      {/* Loading indicators */}
      {(removeParticipantLoading || deleteRoomLoading) && <CommonLoader />}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.White,
    flex: 1,
  },
  scrollView: {
    paddingBottom: 20,
  },
  LeaveGroupCon: {
    backgroundColor: Colors.light.White,
    borderColor: Colors.light.PrimaryColor,
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 30,
  },
  LeavGroupText: {
    color: Colors.light.PrimaryColor,
    paddingVertical: 12,
    textAlign: "center",
  },
  rowDirection: {
    flexDirection: "row",
    alignItems: "center",
  },
  textTypo: {
    fontFamily: fonts.Lato,
    fontStyle: "normal",
  },
  textStyle: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "700",
    color: "red",
    marginLeft: 10,
  },
});
