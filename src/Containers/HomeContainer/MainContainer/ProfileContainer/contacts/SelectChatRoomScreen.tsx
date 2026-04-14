import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { DefaultImageUrl, ImageUrl } from "@Service/provider/endpoints";
import { DoubleUserAction, SingleUserAction } from "@Types/types";
import React, { useCallback, useEffect, useState, useMemo } from "react";

import { AllChatRooms } from "@Atoms/allRoomsAtom";
import { CheckBox } from "react-native-elements";
import Colors from "@/Constants/Colors";
import FastImage from "@d11/react-native-fast-image";
import Ionicons from "react-native-vector-icons/Ionicons";
import { RootState } from "@Store/Reducer";
import { StyleSheet } from "react-native";
import ToastMessage from "@Util/ToastMesage";
import fonts from "@/Constants/fonts";
import { navigate, navigateBack } from "@Navigation/utility";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom } from "jotai";
import { useCreateRoomMutation } from "@Service/generated/room.generated";
import { useFocusEffect } from "@react-navigation/core";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { SelectChatRoomScreenProps } from "@/navigation/screenPropsTypes";
import AntDesign from "react-native-vector-icons/AntDesign";
import { socket } from "@/redux/Reducer/SocketSlice";
import { socketConnect } from "@/utils/socket/SocketConnection";

const { width, height } = Dimensions.get("window");
export default function SelectChatRoomScreen({ route, navigation }: Readonly<SelectChatRoomScreenProps>) {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [otherContacts, setOtherContacts] = useState([]);
  const [loader, setLoader] = useState({
    visible: false,
    userId: undefined,
  });

  const { MyProfile } = useSelector((state: RootState) => state.Chat);
  const { comonContact } = useSelector((state: RootState) => state.Contact);

  const [allChatRooms] = useAtom(AllChatRooms);
  const [display] = useAtom(singleRoom);
  const sourceRoomId = route.params?.sourceRoomId || display?.roomId;
  const goBackDepth = route.params?.goBackDepth ?? 1;
  const [searchSelected, setSearchSelected] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      setSelectedContacts([]);
    }, [])
  );

  useEffect(() => {
    if (allChatRooms.length && comonContact.length) {
      const filteredIndividualRooms = allChatRooms.filter((e) => e.type === "individual");
      if (filteredIndividualRooms.length) {
        let otherContact = comonContact;
        for (const item of filteredIndividualRooms) {
          const participants =
            item?.participants.length > 1
              ? item.participants.find((e) => e?.user_id !== MyProfile?._id)
              : item.participants[0];
          const findIfUserExist = comonContact.find((e) => e?.userId?._id === participants?.user_id);
          if (findIfUserExist) {
            otherContact = otherContact.filter((e) => e?.userId?._id !== participants?.user_id);
          }
        }
        setOtherContacts(otherContact);
      } else {
        setOtherContacts(comonContact);
      }
    }
  }, [comonContact.length, allChatRooms.length]);

  const filterChat = React.useMemo(() => {
    if (search.length > 0) {
      const lowerFilter = search.toLowerCase();
      return allChatRooms
        .filter((item) => {
          const roomLower = item.display?.UserName.toLowerCase();
          const phoneLower = item.display?.PhoneNo.toLowerCase();
          return roomLower.split(" ").find((v) => v.startsWith(lowerFilter)) || phoneLower.includes(lowerFilter);
        })
        .sort((a, b) => a.display.UserName.localeCompare(b.display.UserName));
    } else {
      return [...allChatRooms].sort((a, b) => a.display.UserName.localeCompare(b.display.UserName));
    }
  }, [search, comonContact.length, allChatRooms]);

  return (
    <View style={styles.basicContainer}>
      <View style={styles.headerContainer}>
        <Ionicons name="arrow-back" color="gray" size={30} onPress={onBackPressed} />
        {searchSelected ? (
          <View style={{ flexGrow: 1, maxWidth: width - 80 }}>
            <TextInput
              autoFocus={true}
              style={{ marginLeft: 10, flexGrow: 1, maxWidth: "90%" }}
              onChangeText={(text) => setSearch(text)}
              placeholder={t("share-contact.search-description")}
            />
          </View>
        ) : (
          <View style={{ flexGrow: 1, maxWidth: width - 80, marginLeft: 10 }}>
            <Text style={{ fontSize: 16 }}>{t("send-to")}...</Text>
            <Text style={{ fontSize: 12, marginTop: 3 }}>
              {selectedContacts.length} {t("others.Selected")}
            </Text>
          </View>
        )}
        <Pressable onPress={enableContactSearch}>
          <AntDesign name="search1" color="black" size={24} />
        </Pressable>
      </View>
      <FlatList data={filterChat} renderItem={renderAllRooms} keyExtractor={(_, index) => index.toString()} />
      <Pressable style={styles.nextButtonView} onPress={onPressShareButton}>
        <Ionicons name="send-sharp" color="white" size={22} />
      </Pressable>
    </View>
  );

  function onBackPressed() {
    if (searchSelected) {
      setSearchSelected(false);
      setSearch("");
      return;
    }
    setSelectedContacts([]);
    setSearchSelected(false);

    // navigate("ChatProfileScreen", {
    //   RoomId: display.roomId,
    // });
    navigation.goBack();
  }

  function enableContactSearch() {
    setSearchSelected(true);
  }

  function onPressContact(contact: any) {
    selectDeselectContact(contact?._id);
  }

  function selectDeselectContact(id: string) {
    const clonedSelectedContacts = [...selectedContacts];
    if (clonedSelectedContacts.includes(id)) {
      const selectedContact = clonedSelectedContacts.filter((e) => e !== id);
      setSelectedContacts(selectedContact);
    } else {
      clonedSelectedContacts.push(id);
      setSelectedContacts(clonedSelectedContacts);
    }
  }

  function onPressShareButton() {
    if (selectedContacts.length === 0) {
      ToastMessage(`${t("toastmessage.select-contact-to-share-into-chats")}`);
      return;
    }

    const userToShare =
      display.participants.length > 1
        ? display.participants.find((e) => e.user_id !== MyProfile?._id)
        : display.participants[0];

    if (userToShare) {
      socketConnect.emit("shareContact", {
        contacts: [
          {
            _id: userToShare.user_id,
            firstName: userToShare.firstName,
            lastName: userToShare.lastName,
            phone: userToShare.phone,
            profile_img: userToShare.profile_img,
            groupedContact: [
              {
                _id: userToShare.user_id,
                firstName: userToShare.firstName,
                lastName: userToShare.lastName,
                phone: userToShare.phone,
                profile_img: userToShare.profile_img,
              },
            ],
          },
        ],
        rooms: selectedContacts,
      });
      setTimeout(() => {
        ToastMessage(`${t("toastmessage.contact-shared-successfully")}`);
        setSelectedContacts([]);
        if (goBackDepth > 0) {
          navigation.pop(goBackDepth);
          return;
        }
        if (sourceRoomId) {
          navigation.replace("ChatMessageScreen", {
            RoomId: sourceRoomId,
          });
          return;
        }
        navigation.goBack();
      }, 1000);
    }
  }

  function renderAllRooms({ item, index }) {


    return (
      <TouchableOpacity
        style={[styles.rowDirection, styles.chatContainer]}
        activeOpacity={0.7}
        onPress={() => onPressContact(item)}
        delayLongPress={500}
        disabled={loader.userId ? true : false}
      >
        <View style={styles.imageContainer}>
          <FastImage
            source={{ uri: `${DefaultImageUrl}${item?.display?.UserImage}` }}
            style={{ height: "100%", width: "100%", borderRadius: 50 }}
          />
          {selectedContacts.find((cc) => cc === item._id) && (
            <View style={styles.checkboxView}>
              <AntDesign name="checkcircle" size={18} color="green" />
            </View>
          )}
        </View>
        <View style={styles.profileContainer}>
          <View>
            <Text style={[styles.textTypo, styles.textStyle]}>{item?.display.UserName}</Text>
          </View>

        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  basicContainer: {
    backgroundColor: Colors.light.White,
    flex: 1,
  },
  buttonContainer: {
    alignItems: "center",
    // backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 10,
    justifyContent: "center",
    // paddingHorizontal: 20,
    // paddingVertical: 5,
  },
  chatContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  headerContainer: {
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 10,
    height: 55,
    borderBottomColor: "gray",
    borderBottomWidth: 0.2,
  },
  nextButtonView: {
    position: "absolute",
    zIndex: 3,
    right: 15,
    bottom: 15,
    backgroundColor: Colors.light.PrimaryColor,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
  },
  headerTextStyle: {
    color: Colors.light.black,
    fontSize: 15,
    fontWeight: "500",
  },
  imageContainer: {
    borderRadius: 10,
    height: 50,
    width: 50,
  },
  lastMessageContainer: {
    paddingTop: 3,
  },
  profileContainer: {
    justifyContent: "space-between",
    paddingLeft: 15,
    width: "80%",
  },
  rowDirection: {
    alignItems: "center",
    flexDirection: "row",
  },
  textStyle: {
    color: Colors.light.black,
    fontSize: 15,
    fontWeight: "400",
  },
  textTypo: {
    fontFamily: fonts.Lato,
    fontStyle: "normal",
  },
  checkboxView: {
    position: "absolute",
    zIndex: 3,
    bottom: -4,
    right: -4,
    backgroundColor: "white",
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "white",
  },
});
