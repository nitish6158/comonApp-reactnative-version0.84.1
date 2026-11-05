import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import React, { useState } from "react";
import { ContactRemindersScreenProps } from "@/navigation/screenPropsTypes";
import { HeaderWithScreenName } from "@/Components/header";
import { useTranslation } from "react-i18next";
import { FlatList } from "react-native";
import { useAppSelector } from "@/redux/Store";
import FastImage from "@d11/react-native-fast-image";
import { DefaultImageUrl } from "@/graphql/provider/endpoints";
import { capitalize } from "lodash";
import { MenuProvider, Menu, MenuOptions, MenuOption, MenuTrigger } from "react-native-popup-menu";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { UserContact } from "@/graphql/generated/types";
import { useRemoveContactReminderMutation, useUpdateContactReminderMutation } from "@/graphql/generated/user.generated";
import ToastMessage from "@/utils/ToastMesage";
import { useDispatch } from "react-redux";
import { setMyProfile } from "@/redux/Reducer/ChatReducer";
import ReminderForm from "../contacts/ReminderForm";
import { Colors, fonts } from "@/Constants";

export default function ContactReminders({}: ContactRemindersScreenProps) {
  const { t } = useTranslation();
  const { MyProfile } = useAppSelector((state) => state.Chat);

  const [selectedReminder, setSelectedReminder] = useState<UserContact | null>(null);
  const [removeContactReminder] = useRemoveContactReminderMutation();
  const [updateContactReminder] = useUpdateContactReminderMutation();
  const dispatch = useDispatch();

  return (
    <View style={{ backgroundColor: "white", flex: 1 }}>
      <HeaderWithScreenName title={t("onlineStatus.contact-reminders")} />
      <FlatList
        style={{ paddingHorizontal: 20, marginVertical: 20, marginBottom: 80 }}
        data={MyProfile?.contact_reminder ?? []}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => {
          return (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottomColor: "rgba(51,51,51,.2)",
                borderBottomWidth: 1,
                paddingBottom: 10,
                marginTop: 10,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <FastImage
                  source={{ uri: `${DefaultImageUrl}${item.profile_img}` }}
                  style={{ height: 40, width: 40, borderRadius: 30 }}
                />
                <View style={{ marginLeft: 16 }}>
                  <Text style={{ fontSize: 16, lineHeight: 20 }}>
                    {item.firstName} {item.lastName}
                  </Text>
                  <Text style={{ fontSize: 12, lineHeight: 20 }}>{capitalize(item.frequency)}</Text>
                </View>
              </View>
              <Menu>
                <MenuTrigger style={{ paddingLeft: 20 }}>
                  <MaterialCommunityIcons name="dots-vertical" color="black" size={22} />
                </MenuTrigger>
                <MenuOptions optionsContainerStyle={{}}>
                  <MenuOption
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onSelect={() => {
                      setSelectedReminder(item);
                    }}
                  >
                    <MaterialCommunityIcons name="clock-edit-outline" size={22} color={"gray"} />
                    <Text style={{ fontSize: 14, marginLeft: 5 }}>{t("onlineStatus.update-reminder")}</Text>
                  </MenuOption>
                  <MenuOption
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onSelect={() => {
                      removeContactReminder({
                        variables: {
                          input: {
                            _id: item._id,
                          },
                        },
                      }).then((res) => {
                        if (res.data?.removeContactReminder) {
                          dispatch(setMyProfile(res.data?.removeContactReminder));
                          ToastMessage(t("onlineStatus.reminder-deleted"));
                        }
                      });
                    }}
                  >
                    <MaterialCommunityIcons name="delete-circle-outline" size={22} color={"red"} />
                    <Text style={{ fontSize: 14, marginLeft: 5, color: "red" }}>
                      {t("onlineStatus.delete-reminder")}
                    </Text>
                  </MenuOption>
                </MenuOptions>
              </Menu>
            </View>
          );
        }}
        ListFooterComponent={
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 12, color: "#828282" }}></Text>
          </View>
        }
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedReminder != null}
        onRequestClose={() => {
          setSelectedReminder(null);
        }}
      >
        <Pressable
          style={style.centeredView}
          onPress={() => {
            setSelectedReminder(null);
          }}
        >
          <View style={style.modalView}>
            <ReminderForm
              contact={selectedReminder}
              mode={"update"}
              onSubmit={(data) => {
                setSelectedReminder(null);
                updateContactReminder({
                  variables: {
                    input: { contact_reminder: { ...data, _id: selectedReminder?._id } },
                  },
                }).then((res) => {
                  if (res.data?.updateContactReminder) {
                    ToastMessage(t("onlineStatus.reminder-update"));
                    dispatch(setMyProfile(res.data?.updateContactReminder));
                  }
                });
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const style = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
