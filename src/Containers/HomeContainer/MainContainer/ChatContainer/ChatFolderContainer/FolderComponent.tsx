import { FolderAndTabsAtom } from "@/Atoms";
import { useAtom } from "jotai";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Platform, Pressable, Text, View } from "react-native";
import { ScaleDecorator } from "react-native-draggable-flatlist";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Feather from "react-native-vector-icons/Feather";
import { Menu, MenuItem } from "react-native-material-menu";
import Octicons from "react-native-vector-icons/Octicons";
import AntDesign from "react-native-vector-icons/AntDesign";
import { Colors } from "@/Constants";
import { useNavigation } from "@react-navigation/core";
import { socketConnect } from "@/utils/socket/SocketConnection";
import { useDeleteFolderMutation } from "@/graphql/generated/room.generated";
import { useAppSelector } from "@/redux/Store";
import { useDispatch } from "react-redux";
import { setMyProfile } from "@/redux/Reducer/ChatReducer";

export default function FolderComponent({ item, drag, isActive, onDeleteSuccess }: any) {
  const [visible, setVisible] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [currentTab, setCurrentTab] = useAtom(FolderAndTabsAtom);
  const navigation = useNavigation();
  const [deleteFolder] = useDeleteFolderMutation();
  const myProfile = useAppSelector((state) => state.Chat.MyProfile);
  const dispatch = useDispatch();

  const { t } = useTranslation();
  return (
    <ScaleDecorator>
      <Pressable
        onLongPress={drag}
        disabled={isActive}
        onPress={() => {
          navigation.navigate("CreateFolderScreen", {
            FolderNameParams: item.name,
            isEdit: true,
            FolderItem: item,
          });
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            // borderBottomWidth: 0.4,
            // borderColor: "gray",
            paddingVertical: 12,
            backgroundColor: "white",
            marginLeft: 17,
          }}
        >
          <View style={{ flexDirection: "row", width: "90%", alignItems: "center" }}>
            <MaterialCommunityIcons name="folder-text" size={32} color={Colors.light.PrimaryColor} />
            <Text style={{ textAlign: "center", fontSize: 16, marginLeft: 10 }}>{item.name}</Text>
          </View>
          <Menu
            style={{ width: "63%", marginTop: 30 }}
            visible={visible}
            anchor={
              <Pressable
                onPress={() => {
                  setVisible(!visible);
                }}
              >
                <Feather name="more-vertical" size={24} color="rgba(51,51,51,.8)" />
              </Pressable>
            }
            onRequestClose={() => {
              setVisible(!visible);
            }}
          >
            <MenuItem
              onPress={() => {
                navigation.navigate("CreateFolderScreen", {
                  FolderNameParams: item.name,
                  isEdit: true,
                  FolderItem: item,
                });
                setVisible(!visible);
              }}
            >
              <Octicons name="pencil" size={20} color={Colors.light.PrimaryColor} style={{ marginHorizontal: 33 }} />
              <Text>
                {" "}
                {"  "} {t("btn.edit")}
              </Text>
            </MenuItem>
            <MenuItem
              onPress={() => {
                Alert.alert("", `${t("folder-toastmessage.delete-message")}`, [
                  {
                    text: `${t("btn.cancel")}`,
                    onPress: () => { }, //console.log("Cancel Pressed"),
                    style: "cancel",
                  },
                  {
                    text: `${t("btn.ok")}`,

                    onPress: () => {
                      setVisible(!visible);
                      console.log("item._id", item._id);
                      deleteFolder({
                        variables: {
                          input: { _id: item._id }
                        }
                      }).then((res) => {
                        if (res?.data?.deleteFolder?.success) {
                          onDeleteSuccess?.(item._id);
                          if (myProfile) {
                            const updatedFolders = (myProfile.folders || []).filter(
                              (folder) => folder._id !== item._id
                            );
                            dispatch(setMyProfile({ ...myProfile, folders: updatedFolders }));
                          }
                          socketConnect.emit("getProfile", {} as any);
                        }
                      });
                      let key = item.key + 1;
                      if (key == currentTab) {
                        setCurrentTab(item.key);
                      } else if (key < currentTab) {
                        setCurrentTab(currentTab - 1);
                      }
                    },
                    style: "destructive",
                  },
                ]);
                setVisible(!visible);
                if (Platform.OS == "android") {
                  setTimeout(() => {
                    setDeleteModal(!deleteModal);
                  }, 200);
                }
              }}
            >
              <AntDesign name="delete" size={20} color={Colors.light.PrimaryColor} />
              {"  "} {t("btn.delete")}
            </MenuItem>
          </Menu>
        </View>
      </Pressable>
    </ScaleDecorator>
  );
}
