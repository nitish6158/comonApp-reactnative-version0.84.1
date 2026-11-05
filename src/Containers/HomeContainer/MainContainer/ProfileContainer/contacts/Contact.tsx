import { Image, Share as NativeShare, Platform, Pressable, View } from "react-native";
import React, { memo, useMemo, useState } from "react";
import _, { isEmpty, uniqueId } from "lodash";

import Colors from "@/Constants/Colors";
import Modal from "react-native-modal";
import Text from "@Components/Text";
import { serverContactType } from "@Store/Reducer/ContactReducer";
import styles from "./ContactStyles";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { Linking } from "react-native";
import { MenuProvider, Menu, MenuOptions, MenuOption, MenuTrigger } from "react-native-popup-menu";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { ContactDetailsDto, OnlineStatusFrequency, UserContactInput } from "@/graphql/generated/types";
import FastImage from "@d11/react-native-fast-image";
import { DefaultImageUrl } from "@/graphql/provider/endpoints";
import AntDesign from "react-native-vector-icons/AntDesign";
import { Avatar } from "react-native-ui-lib";

export const replaceNumberPhone = (phone?: string) => {
  return phone?.replace(/[-)(]/gi, "").split(" ").join("");
};

type contacts = {
  item: serverContactType;
  onComonUserContactPressed: (item: ContactDetailsDto) => void;
  loader: boolean;
  onSetReminder: (data: UserContactInput) => void;
  isReminder: UserContactInput | null;
  onDeleteReminder: (userId: string) => void;
  isSefUser: boolean;
};

function Contact({
  item,
  onComonUserContactPressed,
  loader,
  onSetReminder,
  isReminder,
  onDeleteReminder,
  isSefUser,
}: contacts) {
  const fullName = useMemo(() => {
    return item.firstName + " " + item.lastName;
  }, [item]);

  const initials = useMemo(() => {
    return `${item.firstName?.charAt(0)}${
      item.lastName?.charAt(0) ?? item.firstName?.substring(item.firstName?.length - 1)
    }`.toUpperCase();
  }, [item]);

  const isInvited = useMemo(() => {
    if (item.invitedAt == null || item.invitedAt == 0 || item.hasComon == true) {
      return false;
    } else {
      const isExpiryInvite = dayjs().diff(item.invitedAt, "minute");
      return isExpiryInvite < 600;
    }
  }, [item.invitedAt]);

  const avatar = [styles.avatar, item.hasComon ? styles.active : undefined];
  const profileImage = useMemo(() => {
    const image = item?.userId?.profile_img;
    if (!image) return "";
    return image.startsWith("http") ? image : `${DefaultImageUrl}${image}`;
  }, [item?.userId?.profile_img]);
  const { t } = useTranslation();

  return (
    <Pressable
      style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingRight: 20 }}
      onPress={() => {
        if (item.hasComon) {
          onComonUserContactPressed(item);
        }

        if (!item.hasComon) {
          onDialerPressed(item.phone);
        }
      }}
    >
      <View style={styles.contact}>
        {profileImage ? (
          <Avatar source={{ uri: profileImage }} size={40} />
        ) : (
          <Avatar name={fullName || initials} size={40} />
        )}
        <View style={[styles.content, { justifyContent: "center" }]}>
          <View style={{ flexGrow: 1, maxWidth: 160 }}>
            <Text lineNumber={2} size="md">{`${fullName ?? ""}`}</Text>
            <Text lineNumber={1} size="xs" style={{ color: "gray" }}>{`${item.phone}`}</Text>
          </View>
        </View>
      </View>

      {!item.hasComon && (
        <Pressable
          onPress={() => {
            onComonUserContactPressed(item);
          }}
          style={{
            backgroundColor: Colors.light.PrimaryColor,
            height: 34,
            width: 67,
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
          disabled={loader}
        >
          {item.hasComon || isInvited ? (
            <Text size="xs" style={{ color: "white" }}>
              {item.hasComon ? "ComOn" : t("others.Invited")}
            </Text>
          ) : (
            <Text size="xs" style={{ color: "white" }}>
              {t("others.Invite")}
            </Text>
          )}
        </Pressable>
      )}
      {item.hasComon && !isSefUser && (
        <Menu>
          <MenuTrigger style={{ paddingLeft: 20 }}>
            <MaterialCommunityIcons name="dots-vertical" color="black" size={22} />
          </MenuTrigger>
          <MenuOptions optionsContainerStyle={{}}>
            <MenuOption
              style={{ flexDirection: "row", alignItems: "center" }}
              onSelect={() =>
                onSetReminder({
                  mode: isReminder ? "update" : "create",
                  _id: item.userId?._id,
                  firstName: item.firstName,
                  lastName: item.lastName,
                  phone: item.phone,
                  profile_img: item?.userId?.profile_img ?? "",
                  CustomMessage: "",
                  frequency: OnlineStatusFrequency.Once,
                })
              }
            >
              <MaterialCommunityIcons name="clock-edit-outline" size={22} color={"gray"} />
              <Text style={{ fontSize: 14, marginLeft: 5 }}>
                {isReminder ? t("onlineStatus.update-reminder") : t("onlineStatus.set-reminder")}
              </Text>
            </MenuOption>
            {isReminder && (
              <MenuOption
                style={{ flexDirection: "row", alignItems: "center" }}
                onSelect={() => onDeleteReminder(item.userId?._id)}
              >
                <MaterialCommunityIcons name="delete-circle-outline" size={22} color={"red"} />
                <Text style={{ fontSize: 14, marginLeft: 5, color: "red" }}>{t("onlineStatus.delete-reminder")}</Text>
              </MenuOption>
            )}
          </MenuOptions>
        </Menu>
      )}
    </Pressable>
  );

  function onDialerPressed(phone: string) {
    Linking.openURL(`tel:${phone}`);
  }
}

export default Contact;
