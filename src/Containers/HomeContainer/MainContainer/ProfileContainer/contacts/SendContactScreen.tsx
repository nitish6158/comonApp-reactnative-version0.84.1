import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, useMemo } from "react";
import { SendContactScreenProps } from "../../../../../navigation/screenPropsTypes";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/Reducer";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { ContactDetailsDto } from "@/graphql/generated/types";
import { Checkbox, Text } from "react-native-ui-lib";
import { Colors } from "@/Constants";
import ToastMessage from "@Util/ToastMesage";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { socket } from "@/redux/Reducer/SocketSlice";
import useAdvanceNavigation from "@/hooks/useAdvanceNavigation";
import { socketManager } from "@/utils/socket/SocketManager";
import { socketConnect } from "@/utils/socket/SocketConnection";

export default function SendContactScreen({
  route,
  navigation,
}: Readonly<SendContactScreenProps>) {
  const { contactList, RoomId } = route.params;
  const { contacts } = useSelector((state: RootState) => state.Contact);
  const { replaceWithIndex } = useAdvanceNavigation();
  const [groupedContact, setGroupedContact] = useState<ContactDetailsDto[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const value = contactList.map((data) => {
      let mainLocal = data.localId.split("_");
      if (data.localId) {
        let find = contacts
          .filter((con) => {
            let siblingLocal = con.localId.split("_");
            let matched =
              (mainLocal[0] ?? false) === (siblingLocal[0] ?? false);
            return matched;
          })
          .map((cb) => ({ ...cb, isSelected: true }));
        let sibling = _.uniqBy(find, (v) => v.phone);

        return { ...data, sibling };
      }
    });
    setGroupedContact(value);
  }, [contactList, contacts]);

  return (
    <View style={styles.main}>
      <View style={styles.headerContainer}>
        <Ionicons
          name="arrow-back"
          color="gray"
          size={30}
          onPress={navigation.goBack}
        />
        <Text style={{ fontSize: 17, marginLeft: 10 }}>
          {t("send-contacts")}
        </Text>
      </View>
      <View>
        <FlatList
          ListFooterComponent={<View style={{ height: 150 }} />}
          showsVerticalScrollIndicator={false}
          data={groupedContact}
          renderItem={({ item, index }) => {
            return (
              <View key={index}>
                <ContactGroupingView
                  data={item}
                  onSiblingCheckChange={(value) => {
                    let updated = groupedContact.map((gc) => {
                      if (gc.phone === value.phone) {
                        return value;
                      } else {
                        return gc;
                      }
                    });
                    setGroupedContact(updated);
                  }}
                />
              </View>
            );
          }}
        />
      </View>
      <Pressable style={styles.nextButtonView} onPress={onNextButtonPressed}>
        <Ionicons name="send-sharp" color="white" size={22} />
      </Pressable>
    </View>
  );

  function onNextButtonPressed() {
    const con = groupedContact.map((ds) => {
      return {
        _id: ds?.userId?._id ? ds.userId?._id : "",
        firstName: ds.firstName,
        lastName: ds.lastName,
        phone: ds.phone,
        local_Id: ds.localId,
        profile_img: "",
        groupedContact: ds?.sibling
          ? ds?.sibling.filter((sib) => sib.isSelected)
          : [],
      };
    });

    con.forEach((res) => {
      const payload = {
        data: {
          roomId: RoomId,
          type: "contact",
          fileURL: "",
          isForwarded: false,
          message: JSON.stringify(res),
          fontStyle: "",
          thumbnail: "",
          duration: 0,
        },
        reply_msg: null,
      };
      socketManager.conversation.sendChat(payload);
    });
    replaceWithIndex("ChatMessageScreen");
    setTimeout(() => {
      ToastMessage(`${t("toastmessage.contact-shared-successfully")}`);
    }, 1000);

    // return;
    const roo = [RoomId];

    if (socket && typeof socket.emit === "function") {
      socketConnect.emit("shareContact", { contacts: con, rooms: roo });
      // replaceWithIndex("ChatMessageScreen");

      // setTimeout(() => {
      //   ToastMessage(`${t("toastmessage.contact-shared-successfully")}`);
      // }, 1000);
    } else {
      console.error("Socket is not initialized yet.");
    }

    // socket.emit("shareContact", {
    //   contacts: con,
    //   rooms: roo,
    // });
  }
}

type ContactGroupingViewProps = {
  data: ContactDetailsDto;
  onSiblingCheckChange: (data: ContactDetailsDto) => void;
};

function ContactGroupingView({
  data,
  onSiblingCheckChange,
}: Readonly<ContactGroupingViewProps>) {
  return (
    <View style={styles.contactContainer}>
      <View style={styles.parentContainer}>
        <View style={styles.profileView}>
          <Text style={styles.profileText}>
            {`${data?.firstName[0] ?? ""}${data?.lastName[0] ?? ""
              }`.toUpperCase()}
          </Text>
        </View>
        <Text style={{ fontSize: 20, marginLeft: 15 }} text80 marginL-5>
          {`${data.firstName} ${data.lastName}`.length !== 0
            ? `${data.firstName} ${data.lastName}`
            : data.phone}
        </Text>
      </View>
      {data.sibling &&
        data.sibling.map((sc, sci) => {
          return (
            <View key={sci} style={[styles.siblingContainer]}>
              <View style={styles.siblingDetails}>
                <FontAwesome
                  name="phone"
                  size={26}
                  color={Colors.light.PrimaryColor}
                  style={{ marginRight: 15 }}
                />
                <Text style={{ fontSize: 16 }}>{sc.phone}</Text>
              </View>

              <Checkbox
                value={sc.isSelected}
                onValueChange={(value) => {
                  const updated = data.sibling.map((con, coni) => {
                    if (coni === sci) {
                      return { ...con, isSelected: value };
                    } else {
                      return con;
                    }
                  });
                  onSiblingCheckChange({ ...data, sibling: updated });
                }}
                color={Colors.light.PrimaryColor}
                style={{ borderRadius: 5 }}
              />
            </View>
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "white",
  },
  headerContainer: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 10,
    height: 55,
    borderBottomColor: "gray",
    borderBottomWidth: 0.2,
  },
  contactContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 40,
    backgroundColor: Colors.light.PrimaryColor,
    marginRight: 10,
  },

  parentContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: "gray",
    borderBottomWidth: 0.2,
    paddingVertical: 10,
    marginBottom: 10,
  },
  siblingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  siblingDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileView: {
    height: 45,
    width: 45,
    borderRadius: 40,
    backgroundColor: Colors.light.PrimaryColor,
    justifyContent: "center",
  },
  profileText: {
    textAlign: "center",
    color: "white",
    fontWeight: "500",
  },
  nextButtonView: {
    position: "absolute",
    zIndex: 3,
    right: 15,
    bottom: 20,
    backgroundColor: Colors.light.PrimaryColor,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
  },
});
