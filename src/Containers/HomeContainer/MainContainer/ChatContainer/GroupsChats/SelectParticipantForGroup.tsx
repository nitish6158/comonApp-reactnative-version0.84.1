import { View, Text, StyleSheet, Pressable, TextInput, FlatList, ActivityIndicator } from "react-native";
import React, { useMemo, useState } from "react";

import FastImage from "@d11/react-native-fast-image";
import { DefaultImageUrl, GroupUrl, ImageUrl } from "@Service/provider/endpoints";
import AntDesign from "react-native-vector-icons/AntDesign";

import { Colors } from "@/Constants";

import { useCreateRoomMutation } from "@/graphql/generated/room.generated";
import { useNavigation, useRoute } from "@react-navigation/core";
import ToastMessage from "@Util/ToastMesage";

import HeaderWithSearch from "@Components/header/HeaderWithSearch";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "@/redux/Store";
import useActiveContacts from "@/hooks/useActiveContacts";
import useAdvanceNavigation from "@/hooks/useAdvanceNavigation";
import { SelectParticipantForGroupProps } from "@/navigation/screenPropsTypes";

export default function SelectParticipantForGroup({route,navigation}:SelectParticipantForGroupProps) {
  
  const { MyProfile } = useAppSelector((state) => state.Chat);
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [createRoomRequest, createRoomResponse] = useCreateRoomMutation();
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useTranslation();
  const { replaceWithScreen } = useAdvanceNavigation();

  const { getContactList, isLoading } = useActiveContacts();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" }}>
        <ActivityIndicator size="large" color={Colors.light.PrimaryColor} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderWithSearch
        onBackPressed={navigation.goBack}
        onSearchTextChanged={setSearchValue}
        title={"Search Participants"}
        placeholder={`${t("form.label.search")}`}
        dualKeyboard={true}
      />

      <FlatList
        style={{ marginTop: 10, marginBottom: 10 }}
        keyExtractor={(item, index) => index.toString()}
        data={getContactList(searchValue)}
        renderItem={({ item, index }) => {
          let username = item.firstName + " " + item.lastName;
          const isCurrentUser = MyProfile?._id == item._id;

          let isSelected = false;

          selectedMembers.forEach((selected) => {
            if (selected == item._id) {
              isSelected = true;
            }
          });

          if (username.length > 20) {
            username = username?.substring(0, 20) + "...";
          }

          if (isCurrentUser) {
            return <></>;
          }

          return (
            <Pressable
              disabled={createRoomResponse.loading}
              onPress={() => {
                if (isSelected) {
                  setSelectedMembers(selectedMembers.filter((sm) => sm !== item._id));
                } else {
                  setSelectedMembers(selectedMembers.concat([item?._id]));
                }
              }}
              disabled={createRoomResponse.loading}
              style={{
                paddingVertical: 8,
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View>
                  <FastImage
                    style={{ height: 40, width: 40, borderRadius: 20 }}
                    source={{ uri: `${DefaultImageUrl}${item.profile_img ?? ImageUrl}` }}
                  />

                  {isSelected && (
                    <View
                      style={{
                        position: "absolute",
                        backgroundColor: "white",
                        borderRadius: 50,
                        bottom: -2,
                        right: -2,
                      }}
                    >
                      <AntDesign name="checkcircle" color={"green"} size={18} />
                    </View>
                  )}
                </View>
                <View style={{ marginLeft: 20 }}>
                  <Text style={{ fontSize: 16 }}>
                    {username}
                    {isCurrentUser ? "(You)" : ""}
                  </Text>
                  <Text style={{ color: "rgba(51,51,51,.6)", marginRight: 50 }}>{item.bio?.status}</Text>
                </View>
              </View>
            </Pressable>
          );
        }}
        ListFooterComponent={<View style={{ height: 200 }} />}
        ListEmptyComponent={
          <View style={styles.notFoundContainer}>
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.light.PrimaryColor} />
            ) : (
              <Text style={styles.notFoundText}>{`No result found for '${searchValue}'`}</Text>
            )}
          </View>
        }
      />

      <Pressable disabled={createRoomResponse.loading} onPress={onCreatePressed} style={styles.nextButton}>
        {createRoomResponse.loading ? <ActivityIndicator /> : <AntDesign name="arrowright" size={22} color="white" />}
      </Pressable>
    </View>
  );

  async function onCreatePressed() {
    if (selectedMembers.length == 0) {
      ToastMessage(t("label.contact-must-be-selected"));
      return;
    }
    setSearchValue("");
    const response = await createRoomRequest({
      variables: {
        input: {
          type: "group",
          users: selectedMembers,
          name: route.params.roomName,
          profile_img: route.params.roomImage ?? GroupUrl,
          localId: "0",
        },
      },
    });
    if (response.data?.createRoom.roomId) {
      setSelectedMembers([]);
      setLoading(true);
      setTimeout(() => {
        replaceWithScreen(
          {
            name: "ChatMessageScreen",
            params: {
              RoomId: response.data?.createRoom.roomId,
            },
          },
          ["CreateGroupScreen", "SelectParticipantForGroup", "CreateChatRooms"]
        );
        setLoading(false);
      }, 3000);
    } else {
      ToastMessage(t("label.group-creation-issue"));
    }
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  nextButton: {
    position: "absolute",
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    bottom: 20,
    right: 20,
  },
  notFoundText: {
    textAlign: "center",
    fontSize: 18,
    // fontWeight: "500",
    color: "gray",
    maxWidth: 300,
  },
  notFoundContainer: {
    height: 400,
    justifyContent: "center",
    alignItems: "center",
  },
});
