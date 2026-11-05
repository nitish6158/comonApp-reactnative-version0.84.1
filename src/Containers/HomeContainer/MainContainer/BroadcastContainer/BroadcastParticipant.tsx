import CommonHeader from "@Components/header/CommonHeader";
import { Colors, fonts } from "@/Constants";
import { useUploadChatFileMutation } from "@/graphql/generated/auth.generated";
import { useCreateBroadcastRoomMutation } from "@/graphql/generated/room.generated";
import { BroadcastParticipantProps } from "@/navigation/screenPropsTypes";
import { RootState } from "@/redux/Reducer";
import { serverContactType } from "@/redux/Reducer/ContactReducer";
import { generateRNFile } from "@Util/chatUtils/generateRNFile";
import { currentTimeinUnix } from "@Util/date";
import ToastMessage from "@Util/ToastMesage";
import { DefaultImageUrl, ImageUrl } from "@Service/provider/endpoints";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
} from "react-native";
import { FlatList, StyleSheet, View, TextInput, Dimensions } from "react-native";
import FastImage from "@d11/react-native-fast-image";
import { useSelector } from "react-redux";
import { socket } from "@/redux/Reducer/SocketSlice";
import HeaderWithSearch from "@Components/header/HeaderWithSearch";
import AntDesign from "react-native-vector-icons/AntDesign";
import useActiveContacts from "@/hooks/useActiveContacts";
import useAdvanceNavigation from "@/hooks/useAdvanceNavigation";
import { socketConnect } from "@/utils/socket/SocketConnection";

export default function BroadcastParticipant(props: BroadcastParticipantProps) {
  const { navigation, route } = props;
  const { name, image } = route.params;

  const [participantSearchValue, setParticipantSearchValue] = useState("");
  const [selectedParticpant, setSelectedParticipant] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { replaceWithScreen } = useAdvanceNavigation();

  const { t } = useTranslation();

  const { MyProfile } = useSelector((state: RootState) => state.Chat);
  const { getContactList, isLoading } = useActiveContacts();

  const [createBroadcastRoom] = useCreateBroadcastRoomMutation();
  const [fileUpload] = useUploadChatFileMutation();

  return (
    <View style={styles.container}>
      <HeaderWithSearch
        onBackPressed={navigation.goBack}
        onSearchTextChanged={setParticipantSearchValue}
        title={t("broadcastParticipant")}
        placeholder={t("searchParticipant")}
        dualKeyboard={true}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <FlatList
          data={getContactList(participantSearchValue)}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => {
            let username = item.firstName + " " + item.lastName;
            const isCurrentUser = MyProfile?._id == item._id;

            let isSelected = false;

            selectedParticpant.forEach((selected) => {
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
                disabled={loading}
                onPress={() => handlePressParticipant(item?._id)}
                key={index}
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
          contentContainerStyle={{ marginTop: 10 }}
          ListFooterComponent={<View style={{ marginBottom: 20 }} />}
          ListEmptyComponent={
            <View style={styles.notFoundContainer}>
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.light.PrimaryColor} />
              ) : (
                <Text style={styles.notFoundText}>{`No result found for '${participantSearchValue}'`}</Text>
              )}
            </View>
          }
        />
        <Pressable disabled={loading} onPress={handlePressCreate} style={styles.nextButton}>
          {loading ? <ActivityIndicator /> : <AntDesign name="arrowright" size={22} color="white" />}
        </Pressable>
      </KeyboardAvoidingView>
    </View>
  );

  function handlePressParticipant(id: string) {
    if (selectedParticpant.includes(id)) {
      setSelectedParticipant((par) => par.filter((e) => e != id));
    } else {
      setSelectedParticipant((par) => [...par, id]);
    }
  }

  function handlePressCreate() {

    if (selectedParticpant.length == 0) {
      ToastMessage(t("label.contact-must-be-selected"))
      return;
    }
    setParticipantSearchValue("")
    setLoading(true);
    const payload = {
      type: "broadcast",
      users: [...selectedParticpant, MyProfile?._id],
      name: name,
      profile_img: "",
      localId: "1",
    };

    createBroadcastRoom({
      variables: {
        input: payload,
      },
    })
      .then((response) => {
        if (response.errors) {
          console.error("Error in creating broadcast room in response", response.errors);
          ToastMessage(t("errorCreatingBroadcastGroup"));
          setLoading(false);
          return;
        }
        if (response.data?.createBroadcastRoom.roomId) {
          if (!image?.length) {
            setTimeout(() => {
              setLoading(false);
              replaceWithScreen(
                {
                  name: "ChatMessageScreen",
                  params: {
                    RoomId: response?.data?.createBroadcastRoom.roomId,
                  },
                },
                ["Broadcast", "BroadcastParticipant", "CreateChatRooms"]
              );

            }, 3000);
            return;
          }
          const url = image?.[0]?.path;
          const filename = `${currentTimeinUnix()}.${url.split(".").pop()}`;
          const images = {
            uri: url,
            name: filename,
          };
          const fileurl: any = generateRNFile(images);
          fileUpload({
            variables: {
              file: fileurl,
              input: {
                roomId: response.data.createBroadcastRoom.roomId,
                _id: MyProfile?._id,
              },
            },
          }).then((res) => {
            if (res.errors) {
              console.error("Error in creating broadcast", res.errors);
              setTimeout(() => {
                setLoading(false);
                replaceWithScreen(
                  {
                    name: "ChatMessageScreen",
                    params: {
                      RoomId: response?.data?.createBroadcastRoom.roomId,
                    },
                  },
                  ["Broadcast", "BroadcastParticipant", "CreateChatRooms"]
                );
              }, 3000);
              return;
            }
            socketConnect.emit("setRoomPicture", {
              imageURl: res?.data?.UploadChatFile?.data.filename,
              roomId: response?.data?.createBroadcastRoom.roomId,
            });
            setTimeout(() => {
              setLoading(false);
              replaceWithScreen(
                {
                  name: "ChatMessageScreen",
                  params: {
                    RoomId: response?.data?.createBroadcastRoom.roomId,
                  },
                },
                ["Broadcast", "BroadcastParticipant", "CreateChatRooms"]
              );
            }, 3000);
          });
        }
      })
      .catch((err) => {
        console.error("Error in creating broadcast room", err);
        setLoading(false);
      });
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.White,
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
    maxWidth: 300
  },
  notFoundContainer: {
    height: 400,
    justifyContent: "center",
    alignItems: "center",
  },
  searchTextInputContainer: {
    width: Dimensions.get("screen").width - 50,
    borderWidth: 1,
    borderColor: Colors.light.Hiddengray,
    alignSelf: "center",
    paddingHorizontal: 20,
    height: 45,
    marginVertical: 15,
    borderRadius: 20,
  },
  rowDirection: {
    flexDirection: "row",
    alignItems: "center",
  },
  particpantContainer: {
    marginHorizontal: 20,
    justifyContent: "space-between",
  },
  textTypo: {
    fontFamily: fonts.Lato,
    fontStyle: "normal",
  },
  buttonContainer: {
    padding: 7,
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.7)",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
