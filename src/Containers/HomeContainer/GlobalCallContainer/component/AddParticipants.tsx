import { DefaultImageUrl, ImageUrl } from "@Service/provider/endpoints";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { memo, useMemo, useState, useEffect } from "react";

import AntDesign from "react-native-vector-icons/AntDesign";
import Colors from "@/Constants/Colors";
import FastImage from "@d11/react-native-fast-image";
import Feather from "react-native-vector-icons/Feather";
import { FlatList } from "react-native-gesture-handler";
import Ionicons from "react-native-vector-icons/Ionicons";
import { RootState } from "@Store/Reducer";
import { useAddParticipantsMutation } from "@Service/generated/call.generated";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import useActiveContacts from "@/hooks/useActiveContacts";
import { Avatar } from "react-native-ui-lib";
import Lottie from "lottie-react-native";
import { createStorage } from "@/utils/mmkvStorage";
import { socketManager } from "@/utils/socket/SocketManager";

type Props = {
  currentParticipantsList: {
    _id: string;
    uid: string;
    profile_img: string;
    userName: string;
    micEnable: boolean;
    callStatus: string;
  }[];
  callId: string;
  origin: string;
  onBackPress: Function;
  roomId: null | string;
};

function AddParticipants({
  currentParticipantsList,
  onBackPress,
  callId,
  roomId,
}: Props) {
  const { getContactList, isLoading } = useActiveContacts();
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [addParticipantRequest, addParticipantResponse] =
    useAddParticipantsMutation();
  const { MyProfile } = useSelector((state: RootState) => state.Chat);
  const { t } = useTranslation();
  const storage = createStorage({
    id: `active-contacts-storage`,
    encryptionKey: "active-contacts-key",
  });
  const [contacts, setContacts] = useState([]);

  const availableParticipants = useMemo(() => {
    if (!currentParticipantsList) return [];

    const av = contacts
      .filter((cc) => {
        const found = currentParticipantsList.find((cpl) => cpl.pId === cc._id);

        return !found;
      })
      .filter(
        (ccf) =>
          MyProfile.blockedRooms.filter((blr) => blr.pid === ccf._id).length ===
          0,
      );

    return av;
  }, [contacts, currentParticipantsList, MyProfile.blockedRooms]);

  useEffect(() => {
    const savedContacts = storage.getString("activeContacts");

    if (savedContacts) {
      try {
        const parsedContacts = JSON.parse(savedContacts);
        setContacts(parsedContacts);
      } catch (error) {
        console.error("Error parsing stored contacts", error);
      }
    }

    socketManager.chatRoom.getActiveContacts((data) => {
      if (data) {
        try {
          storage.set("activeContacts", JSON.stringify(data));
          setContacts(data);
        } catch (error) {
          console.error("Error saving contacts", error);
        }
      }
    });
  }, []);

  useEffect(() => {
    console.log("availableParticipants", availableParticipants);
    console.log("currentParticipantsList", currentParticipantsList);
  }, [availableParticipants, currentParticipantsList]);

  return (
    <View style={styles.main}>
      <View style={styles.headerContainer}>
        <Pressable
          style={styles.headerContainer_BackContainer}
          onPress={() => {
            setSelectedContacts([]);
            onBackPress();
          }}
        >
          <Ionicons name="chevron-back" size={26} color="black" />
          <Text style={styles.headerContainer_BackContainer_text}>
            {t("others.Select Participants")}
          </Text>
        </Pressable>
        {selectedContacts.length > 0 &&
          (addParticipantResponse.loading ? (
            <View>
              <Text>{t("others.Calling..")}</Text>
            </View>
          ) : (
            <Text
              onPress={() => {
                const payload = {
                  variables: {
                    input: {
                      callId: callId,
                      participants: selectedContacts,
                    },
                  },
                };
                addParticipantRequest(payload).then((res) => {
                  if (res.errors) {
                    console.error("Error", res.errors);
                  }
                  if (res.data?.addParticipants != null) {
                    setSelectedContacts([]);
                    onBackPress(selectedContacts);
                  }
                });
              }}
              style={styles.headerContainer_durationText}
            >
              {t("add")}
            </Text>
          ))}
      </View>

      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Lottie
            source={require("../../../../../assets/lottie/loader.json")}
            style={{ height: 100, width: 100, marginVertical: 20 }}
            autoPlay
            loop
          />
        </View>
      ) : (
        <FlatList
          data={availableParticipants}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => {
            let isSelected = selectedContacts.filter((sc) => sc === item._id);
            return (
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginVertical: 8,
                  marginHorizontal: 10,
                }}
                onPress={() => {
                  if (isSelected.length == 0) {
                    const clonedSelectedContacts = [...selectedContacts];
                    clonedSelectedContacts.push(item._id);
                    setSelectedContacts(clonedSelectedContacts);
                  } else {
                    let a = selectedContacts.filter((sc) => sc != item._id);
                    setSelectedContacts(a);
                  }
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Avatar
                    source={{
                      uri: `${DefaultImageUrl}${item.profile_img ?? ImageUrl}`,
                    }}
                    size={50}
                  />
                  <View style={{ marginLeft: 15, width: "70%" }}>
                    <Text style={{ fontSize: 15 }}>
                      {item.firstName + " " + item.lastName}
                    </Text>
                    <Text style={{ fontSize: 13, color: "gray" }}>
                      {item.phone}
                    </Text>
                  </View>
                </View>
                <View>
                  {isSelected.length != 0 ? (
                    <AntDesign
                      name="checkcircle"
                      size={24}
                      color={Colors.light.PrimaryColor}
                    />
                  ) : (
                    <Feather name="circle" size={24} color={"gray"} />
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={<View style={{ height: 100 }}></View>}
        />
      )}
    </View>
  );
}

export default memo(AddParticipants);

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    borderBottomColor: "rgba(51,51,51,.2)",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  headerContainer_BackContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
  headerContainer_BackContainer_icon: {},
  headerContainer_BackContainer_text: {
    color: "black",
    fontSize: 17,
    marginLeft: 10,
  },
  headerContainer_durationText: {
    color: "black",
    fontSize: 16,
  },
  main: {
    flex: 1,
  },
});
