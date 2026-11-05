import { View, Text, StyleSheet, Pressable, FlatList, Dimensions } from "react-native";
import React, { useState, useCallback } from "react";
import { CreateChatRoomsProps } from "@/navigation/screenPropsTypes";
import HeaderWithSearch from "@Components/header/HeaderWithSearch";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/core";

import FastImage from "@d11/react-native-fast-image";
import { DefaultImageUrl } from "@/graphql/provider/endpoints";
import { Colors, fonts } from "@/Constants";
import { useCreateRoomMutation } from "@/graphql/generated/room.generated";
import AntDesign from "react-native-vector-icons/AntDesign";
import Color from "@/Constants/Colors";

import Feather from "react-native-vector-icons/Feather";
import useActiveContacts from "@/hooks/useActiveContacts";
import { HeaderWithScreenName } from "@/Components/header";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Lottie from "lottie-react-native";

export default function CreateChatRooms({ navigation, route }: CreateChatRoomsProps) {
  const [search, setSearch] = useState<string>("");
  const { t } = useTranslation();
  const [createRoomRequest] = useCreateRoomMutation();
  const { getContactList, isLoading, activeContactsData } = useActiveContacts();
  const { width, height } = Dimensions.get("window");
  const [contacts, setContacts] = useState([]);

  // Use useFocusEffect to call getContactList when the screen is focused
  useFocusEffect(
    useCallback(() => {
      const contactList = getContactList(search);
      setContacts(contactList);
    }, [search, activeContactsData])
  );

  return (
    <View style={styles.main}>
      <HeaderWithSearch
        onBackPressed={navigation.goBack}
        onSearchTextChanged={setSearch}
        title={""}
        placeholder={`${t("form.label.search")}`}
        dualKeyboard={true}
      />

      <View style={{ flex: 1 }}>
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <Lottie
              source={require("../../../../../../assets/lottie/loader.json")}
              style={{ height: 100, width: width / 2 }}
              autoPlay
              loop
            />
          </View>
        ) : (
          <FlatList
            ListHeaderComponent={<ListHeader />}
            data={contacts}
            renderItem={({ item, index }) => {
              return (
                <Pressable
                  style={styles.contactContainer}
                  key={index}
                  onPress={() => {
                    OnContactPressed(item?.userId);
                  }}
                >
                  <FastImage source={{ uri: `${DefaultImageUrl}${item?.profile_img}` }} style={styles.contactProfile} />
                  <View>
                    <Text style={styles.contactName}>{`${item?.firstName ?? ""} ${item?.lastName ?? ""}`}</Text>
                    <Text style={styles.contactStatus}>{item?.phone ?? ""}</Text>
                  </View>
                </Pressable>
              );
            }}
            ListFooterComponent={<View style={{ height: 300 }}></View>}
            ListEmptyComponent={<ListEmpty />}
          />
        )}
      </View>
    </View>
  );

  function ListEmpty() {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>{`${t("label.no-result-found-for")} '${search}'`}</Text>
      </View>
    );
  }

  function ListHeader() {
    if (contacts.length == 0) {
      return <></>;
    }
    return (
      <View style={styles.newChatContainer}>
        <Text style={{ color: "gray", marginBottom: 15 }}>{t("label.new-chatroom")}</Text>
        <Pressable
          onPress={() => {
            navigation.navigate("CreateGroupScreen", { mode: "add" });
          }}
          style={styles.newChatButton}
        >
          <View style={[styles.contactProfile, styles.icon]}>
            <AntDesign name="addusergroup" size={22} color="white" />
          </View>

          <View style={{ marginRight: 60 }}>
            <Text style={styles.newChatTitle}>{t("label.new-group")}</Text>
            <Text style={styles.contactStatus}>{t("groupDescModal")}</Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => {
            navigation.navigate("Broadcast", {});
          }}
          style={styles.newChatButton}
        >
          <FastImage style={styles.contactProfile} source={require("@Images/broadcast.png")} />
          <View style={{ marginRight: 60 }}>
            <Text style={styles.newChatTitle}>{t("label.new-broadcast")}</Text>
            <Text style={styles.contactStatus}>{t("broadcastDescModal")}</Text>
          </View>
        </Pressable>

        <Text style={{ color: "gray", marginTop: 10, marginBottom: 15 }}>{t("label.organize")}</Text>
        <Pressable
          onPress={() => {
            navigation.navigate("CreateTopicsScreen", {});
          }}
          style={styles.newChatButton}
        >
          <View style={[styles.contactProfile, styles.icon]}>
            <Feather name="target" size={20} color="white" />
          </View>
          <View style={{ marginRight: 60 }}>
            <Text style={styles.newChatTitle}>{t("label.new-topic")}</Text>
            <Text style={styles.contactStatus}>{t("label.new-topic-description")}</Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => {
            navigation.navigate("CreateFolderScreen", { isEdit: false });
          }}
          style={styles.newChatButton}
        >
          <View style={[styles.contactProfile, styles.icon]}>
            <MaterialCommunityIcons name="folder-text-outline" color="white" size={20} />
          </View>
          <View style={{ marginRight: 60 }}>
            <Text style={styles.newChatTitle}>{t("label.new-folder")}</Text>
            <Text style={styles.contactStatus}>{t("label.new-folder-description")}</Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => {
            navigation.navigate("ViewDatabaseScreen", { parentId: null, title: t("userDatabase.title") });
          }}
          style={styles.newChatButton}
        >
          <View style={[styles.contactProfile, styles.icon]}>
            <Feather name="database" color="white" size={18} />
          </View>
          <View style={{ marginRight: 60 }}>
            <Text style={styles.newChatTitle}>{t("label.new-database")}</Text>
            <Text style={styles.contactStatus}>{t("label.new-database-record")}</Text>
          </View>
        </Pressable>

        <Text style={styles.sectionTitle}>{t("label.contacts-on-comon")}</Text>
      </View>
    );
  }

  function OnContactPressed(userId: string) {
    createRoomRequest({
      variables: {
        input: {
          type: "individual",
          users: [userId],
          localId: "0",
          profile_img: null,
          name: "",
        },
      },
    }).then((res) => {
      if (res.data?.createRoom.success) {
        navigation.replace("ChatMessageScreen", {
          RoomId: res.data.createRoom.roomId,
        });
      }
    });
  }
}

const styles = StyleSheet.create({
  main: {
    backgroundColor: "white",
    flex: 1,
  },
  icon: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Color.light.PrimaryColor,
  },
  newChatContainer: {
    marginBottom: 10,
    paddingHorizontal: 20,
    marginTop: 5,
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
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  newChatTitle: {
    fontFamily: fonts.Lato,
    fontSize: 16,
    color: "black",
  },
  sectionTitle: {
    marginTop: 20,
    color: "gray",
  },
  contactContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    marginBottom: 5,
    paddingHorizontal: 20,
  },
  contactProfile: {
    height: 40,
    width: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  contactName: {
    fontSize: 15,
    fontFamily: fonts.Lato,
    color: "black",
  },
  contactStatus: {
    color: "gray",
    fontSize: 13,
    marginRight: 50,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
