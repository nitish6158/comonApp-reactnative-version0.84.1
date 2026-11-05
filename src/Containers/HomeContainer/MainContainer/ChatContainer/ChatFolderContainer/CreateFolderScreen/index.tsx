import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  ToastAndroid,
  View
} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useAtom } from "jotai";
import { useFocusEffect } from "@react-navigation/core";
import { useTranslation } from "react-i18next";
import { fonts } from "react-native-elements/dist/config";

import { AllChatRooms } from "@Atoms/allRoomsAtom";
import Colors from "@/Constants/Colors";
import CommonLoader from "@Components/CommonLoader";
import { DefaultImageUrl } from "@Service/provider/endpoints";
import Text from "@Components/Text";
import SelectGrupHeader from "./Header";
import { socketConnect } from "@/utils/socket/SocketConnection";
import { CreateFolderScreenProps } from "@/navigation/screenPropsTypes";
import { useAppSelector } from "@/redux/Store";
import { contactReducerType } from "@Store/Reducer/ContactReducer";
import { useCreateFolderMutation, useEditFolderMutation } from "@/graphql/generated/room.generated";
import { useRefreshSessionLazyQuery } from "@/graphql/generated/auth.generated";
import { useDispatch } from "react-redux";
import { setMyProfile } from "@/redux/Reducer/ChatReducer";
import { getSession } from "@/utils/session";
import VersionCheck from "react-native-version-check";
import { storage } from "@/redux/backup/mmkv";
import { keys } from "@/redux/backup/keys";

// Types
type RoomType = {
  firstName: string;
  lastName: string;
  profile_img: string;
  roomId: string;
  isSelected: boolean;
};

type ContactType = contactReducerType["contacts"][0] & { isSelected: boolean };

const { width, height } = Dimensions.get("window");

// Minimum folder name length required
const MIN_FOLDER_NAME_LENGTH = 4;

export default function CreateFolderScreen({ navigation, route }: Readonly<CreateFolderScreenProps>) {
  const { isEdit, FolderItem } = route.params;
  const { t } = useTranslation();

  const myProfile = useAppSelector((state) => state.Chat.MyProfile);
  const dispatch = useDispatch();
  const [chatRooms] = useAtom(AllChatRooms);

  const [createFolder] = useCreateFolderMutation()
  const [editFolder] = useEditFolderMutation()
  const [refreshRequest] = useRefreshSessionLazyQuery();

  // State
  const [folderName, setFolderName] = useState<string>("");
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Initialize data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isEdit && FolderItem) {
        setSelectedRooms(FolderItem?.roomId || []);
        setFolderName(FolderItem?.name || "");
      } else {
        resetForm();
      }
    }, [isEdit, FolderItem])
  );

  // Load chat rooms data
  useEffect(() => {
    if (rooms.length === 0 && chatRooms.length > 0 && myProfile?._id) {
      loadRooms();
    }
  }, [chatRooms, myProfile?._id, rooms.length]);

  // Load available rooms for selection
  const loadRooms = () => {
    const filteredRooms = chatRooms
      .filter((room) => {
        // Filter out archived rooms
        const isArchived = room.archivedBy.some(archive => archive.user_id === myProfile?._id);
        return !isArchived;
      })
      .map((item) => {
        // Create room data structure
        const roomData: RoomType = {
          firstName: item.display.UserName,
          lastName: "",
          profile_img: item.display.UserImage,
          roomId: item._id,
          isSelected: isEdit && FolderItem?.roomId?.includes(item._id.toString())
        };

        return roomData;
      });

    setRooms(filteredRooms);
  };

  // Reset form state
  const resetForm = () => {
    setFolderName("");
    setSelectedRooms([]);
    setRooms([]);
  };

  // Handle room selection toggle
  const handleRoomSelection = (roomId: string, isSelected: boolean) => {
    setSelectedRooms(prev => {
      if (isSelected) {
        return prev.filter(id => id !== roomId);
      } else {
        return [...prev, roomId];
      }
    });
  };

  // Save folder (create or update)
  const handleSaveFolder = async () => {
    setLoading(true);

    try {
      if (isEdit && FolderItem) {
        const folderId = String(FolderItem?._id || "");
        const nextName = folderName.trim();
        const response = await editFolder({
          variables: {
            input: {
              folderId,
              newName: nextName,
              rooms: selectedRooms,
            },
          },
        });

        if (response.errors || !response?.data?.editFolder?.success) {
          // Backend may return 200 with `editFolder: null`; fallback to socket path.
          await socketConnect.emit("editFolder", {
            folderId,
            newName: nextName,
            rooms: selectedRooms,
          } as any);
        }

        if (myProfile) {
          const updatedFolders = (myProfile.folders || []).map((folder) =>
            folder._id === folderId
              ? { ...folder, name: nextName, roomId: selectedRooms }
              : folder
          );
          dispatch(setMyProfile({ ...myProfile, folders: updatedFolders }));
        }
        console.log("Folder updated successfully");
      } else {
        const response = await createFolder({
          variables: {
            input: {
              folderName,
              rooms: selectedRooms,
            },
          },
        });

        if (response.errors || !response?.data?.createFolder?.success) {
          throw new Error(response?.data?.createFolder?.message || "Unable to create folder");
        }
        console.log("Folder created successfully");
      }

      try {
        const session = await getSession();
        const deviceRaw = storage.getString(keys.device);
        const device = deviceRaw ? JSON.parse(deviceRaw) : null;

        if (session?.refresh && device) {
          const refreshRes = await refreshRequest({
            variables: {
              input: {
                refresh: session.refresh,
                plateform: Platform.OS === "ios" ? "iOS" : "ANDROID",
                appVersion: VersionCheck.getCurrentVersion(),
                device: {
                  ...device,
                  webToken: [],
                },
              },
            },
            fetchPolicy: "network-only",
          });

          const refreshedUser = refreshRes?.data?.refreshSession?.user;
          if (refreshedUser) {
            dispatch(setMyProfile(refreshedUser as any));
          }
        }
      } catch (refreshError) {
        console.log("Error in refresh session after folder save", refreshError);
      }

      await socketConnect.emit("getProfile", {} as any);
      await new Promise((resolve) => setTimeout(resolve, 400));

      navigation.goBack();

      // Show success toast message
      setTimeout(() => {
        ToastAndroid.showWithGravity(
          isEdit
            ? t("folder-toastmessage.folder-updated-successfully")
            : t("folder-toastmessage.folder-created-successfully"),
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM
        );
      }, 500);
    } catch (error) {
      console.error("Error saving folder:", error);
      ToastAndroid.showWithGravity(
        t("folder-toastmessage.folder-error"),
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM
      );
      if (isEdit) {
        navigation.goBack();
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if submit button should be enabled
  const isSaveButtonEnabled = () => {
    if (loading) return false;
    if (isEdit) return true;
    return selectedRooms.length > 0 && folderName.length >= MIN_FOLDER_NAME_LENGTH;
  };

  // Render profile avatar for a room
  const renderProfileAvatar = useCallback((item: ContactType | RoomType) => {
    if (item.profile_img && item.profile_img.length > 0) {
      return (
        <Image
          source={{ uri: `${DefaultImageUrl}${item.profile_img}` }}
          style={styles.avatarImage}
        />
      );
    }

    return (
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarInitials}>
          {`${item.firstName[0].toUpperCase()}${item.lastName.length > 0 ? item.lastName[0].toUpperCase() : ""
            }`}
        </Text>
      </View>
    );
  }, []);

  // Render room selection item
  const renderRoomItem = (item: RoomType, index: number) => {
    const isSelected = selectedRooms.includes(item.roomId);

    return (
      <View key={index} style={styles.roomItem}>
        <View>
          <BouncyCheckbox
            isChecked={isSelected}
            onPress={() => handleRoomSelection(item.roomId, isSelected)}
            fillColor={Colors.light.blue}
          />
        </View>

        <View style={styles.roomInfo}>
          {renderProfileAvatar(item)}
          <View style={styles.roomNameContainer}>
            <Text style={styles.roomName}>
              {item.firstName} {item.lastName}
            </Text>
          </View>
        </View>


      </View>
    );
  };

  // Render room selection list
  const renderRoomSelectionList = () => {
    return (
      <View style={styles.roomsListContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          {rooms.map((item, index) => renderRoomItem(item, index))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SelectGrupHeader
        Title={isEdit ? t("titles.EditFolder") : t("titles.NewFolder")}
        onbackPresss={() => {
          navigation.goBack();
          resetForm();
        }}
        isEdit={false}
      />

      <View style={styles.content}>
        {/* Folder Name Input */}
        <View style={styles.inputContainer}>
          <TextInput
            onChangeText={setFolderName}
            value={folderName}
            maxLength={15}
            placeholder={t("form.label.enter")}
            placeholderTextColor="gray"
            style={styles.input}
          />

          {isSaveButtonEnabled() && (
            <Pressable
              style={styles.saveButton}
              onPress={handleSaveFolder}
            >
              <Text style={styles.saveButtonText}>
                {isEdit ? t("navigation.update") : t("navigation.create")}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Room Selection */}
        <Text size="sm" style={styles.sectionTitle}>
          {t("form.label.select-chats-rooms")}
        </Text>

        {renderRoomSelectionList()}

        {loading && <CommonLoader />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  content: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 30,
    marginBottom: 10,
    borderBottomColor: "gray",
    borderBottomWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 5,
    marginRight: 15,
  },
  saveButton: {
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  saveButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "500",
  },
  sectionTitle: {
    marginVertical: 5,
    marginTop: 30,
  },
  roomsListContainer: {
    maxHeight: height / 1.3,
    paddingBottom: 30,
  },
  scrollView: {
    marginTop: 10,
  },
  scrollViewContent: {
    paddingBottom: 120,
  },
  roomItem: {
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    width: width - 40,
  },
  roomInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  roomNameContainer: {
    marginLeft: 10,
  },
  roomName: {
    fontSize: 16,
    fontFamily: fonts.Lato,
  },
  avatarImage: {
    height: 35,
    width: 35,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    height: 35,
    width: 35,
    borderRadius: 40,
    backgroundColor: Colors.light.PrimaryColor,
    justifyContent: "center",
  },
  avatarInitials: {
    textAlign: "center",
    color: "white",
    fontWeight: "500",
  },
});
