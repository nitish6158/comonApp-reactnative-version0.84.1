import { View, Text, Pressable, ActivityIndicator } from "react-native";
import React from "react";

import { useAtomValue, useSetAtom } from "jotai";

import Ionicons from "react-native-vector-icons/Ionicons";
import { AllChatRooms, conversationLimit } from "@/Atoms";
import dayjs from "dayjs";
import FastImage from "@d11/react-native-fast-image";
import { DefaultImageUrl, ImageUrl } from "@Service/provider/endpoints";
import { ParticipantAcceptStatus } from "@/graphql/generated/types";
import { Chip } from "react-native-ui-lib";

import {
  useDeleteReminderMutation,
  useUpdateReminderApprovalParentMutation,
  useUpdateReminderApprovalStatusMutation,
} from "@/graphql/generated/reminder.generated";

import { useNavigation } from "@react-navigation/core";

import { Menu, MenuOption, MenuOptions, MenuTrigger, renderers } from "react-native-popup-menu";
import { FlatList } from "react-native";
import MessageCommon from "../../ChatContainer/ScheduleMessages/ViewScheduleMessage/components/MessageCommon";
import docIcon from "@Assets/images/docs";
import { changeEventParticipantStatus } from "@/notification/BackgroundCalls";
import { screenStyle as schStyles } from "../../ChatContainer/ScheduleMessages/ViewScheduleMessage/viewSchedule.styles";
import Feather from "react-native-vector-icons/Feather";
import { EventType } from "@notifee/react-native";
import { navigate } from "@/navigation/utility";
import { reminder } from "@/schemas/schema";
import ToastMessage from "@Util/ToastMesage";
import { useTranslation } from "react-i18next";
import CalendarDataManipulator from "../CalendarDataManipulator";

type ApprovalCardProps = {
  item: reminder;
  index: number;
};

export default function ApprovalCard({ item, index }: ApprovalCardProps) {
  const rooms = useAtomValue(AllChatRooms);
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [deleteEventRequest] = useDeleteReminderMutation();
  const [updateStatusRequest, updateStatusResponse] = useUpdateReminderApprovalParentMutation();

  const setLimit = useSetAtom(conversationLimit);
  let roomName = rooms.find((v) => v._id === item.roomId);
  let roomDetails = {
    profile: roomName?.display.UserImage ?? ImageUrl,
    name: roomName?.display.UserName ?? "UnKnown Room",
  };
  return (
    <View key={item._id} style={{ paddingHorizontal: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Pressable
          onPress={() => {
            setLimit(20);
            navigate("ChatMessageScreen", {
              RoomId: item?.roomId,
            });
          }}
          style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
        >
          <FastImage
            source={{ uri: `${DefaultImageUrl}${roomDetails.profile}` }}
            style={{ width: 30, height: 30, borderRadius: 30 }}
          />
          <Text style={{ fontSize: 16, marginLeft: 10 }}>{roomDetails.name}</Text>
        </Pressable>
        <Menu key={index} renderer={renderers.Popover}>
          <MenuTrigger>
            <View style={{ marginLeft: 10 }}>
              <Feather name="more-vertical" size={18} color={"black"} />
            </View>
          </MenuTrigger>
          <MenuOptions>
            <MenuOption
              onSelect={() => {
                navigation.goBack();
                navigation.navigate("CreateScheduleMessage", {
                  mode: "update",
                  ...item,
                });
              }}
              text={t("reminders.change")}
              customStyles={{
                optionText: {
                  fontSize: 16,
                  marginRight: 10,
                  paddingHorizontal: 5,
                },
              }}
            />

            <MenuOption
              onSelect={() => {
                deleteEventRequest({
                  variables: { input: { _id: item._id, thisOccurrence: true, allOccurrence: false } },
                })
                  .then((res) => {
                    navigation.goBack();
                  })
                  .catch(console.log);
              }}
              text={t("reminders.delete")}
              customStyles={{
                optionText: {
                  fontSize: 16,
                  marginRight: 10,
                  paddingHorizontal: 5,
                },
              }}
            />
          </MenuOptions>
        </Menu>
      </View>
      <View style={{}}>
        <FlatList
          // showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 5 }}
          data={item.message}
          // horizontal={true}
          numColumns={3}
          renderItem={(message) => {
            let isCaption =
              message.item.type === "IMAGE" || message.item.type === "VIDEO" ? "" : message.item.message ?? "";

            return (
              <View
                key={message.index}
                style={{
                  // alignSelf: "flex-end",
                  backgroundColor: "#F3F9FC",
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  borderRadius: 5,
                }}
              >
                <MessageCommon message={isCaption}>
                  <View>
                    {message.item.type === "DOCUMENT" && (
                      <View
                        style={{
                          marginHorizontal: 5,
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "rgba(243,243,243,1)",
                          marginBottom: 5,
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: "white",
                            paddingHorizontal: 5,
                            paddingVertical: 5,
                            borderRadius: 5,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <FastImage source={docIcon.doc} style={{ width: 30, height: 30 }} />
                        </View>
                        <Text style={{ fontSize: 12, marginHorizontal: 10, width: 80 }}>
                          {message.item.fileURL?.split("/").pop()}
                        </Text>
                      </View>
                    )}
                    {message.item.type === "IMAGE" && (
                      <Pressable
                        onPress={() =>
                          navigation.navigate("ViewScheduleAttachment", {
                            type: "image",
                            url: `${DefaultImageUrl}${message.item.fileURL}`,
                            caption: message.item.message ?? "",
                          })
                        }
                      >
                        <FastImage
                          source={{ uri: `${DefaultImageUrl}${message.item.fileURL}` }}
                          style={schStyles.imageStyle}
                        />
                      </Pressable>
                    )}
                    {message.item.type === "VIDEO" && (
                      <Pressable
                        onPress={() =>
                          navigation.navigate("ViewScheduleAttachment", {
                            type: "video",
                            url: `${DefaultImageUrl}${message.item.fileURL}`,
                            caption: message.item.message ?? "",
                          })
                        }
                      >
                        <FastImage
                          source={{ uri: `${DefaultImageUrl}${message.item.thumbnail}` }}
                          style={schStyles.imageStyle}
                        />
                        <View style={schStyles.videoPlayButton}>
                          <Ionicons name="ios-play-sharp" size={30} color="white" />
                        </View>
                      </Pressable>
                    )}
                  </View>
                </MessageCommon>
              </View>
            );
          }}
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 10,
          }}
        >
          <Text style={{ fontSize: 14, alignSelf: "flex-end", marginBottom: 3 }}>
            {dayjs(item.startDate).calendar(null, {
              sameDay: `[${t("reminders.today")} at] h:mm A`,
              nextDay: `[${t("reminders.tomorrow")} at] h:mm A`,
              nextWeek: `[${t("reminders.next")}] dddd | h:mm A`,
              sameElse: "DD MMMM YYYY | h:mm A",
            })}
          </Text>
          <View style={{ width: 10 }} />
          {!updateStatusResponse.loading ? (
            <View>
              {item.participants[0].accepted === ParticipantAcceptStatus["Pending"] && (
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                  <Chip
                    label={t("reminders.approve")}
                    onPress={() => {
                      updateStatus(ParticipantAcceptStatus["Accept"], item.parent_id);
                    }}
                  />
                  <View style={{ width: 5 }} />
                  <Chip
                    label={t("reminders.reject")}
                    onPress={() => {
                      updateStatus(ParticipantAcceptStatus["Reject"], item.parent_id);
                    }}
                  />
                </View>
              )}
              {item.participants[0].accepted === ParticipantAcceptStatus["Reject"] && (
                <Chip
                  label={t("reminders.reject")}
                  labelStyle={{ color: "red" }}
                  containerStyle={{ borderColor: "red" }}
                />
              )}
            </View>
          ) : (
            <ActivityIndicator />
          )}
        </View>
      </View>
    </View>
  );

  function updateStatus(status, id) {
    updateStatusRequest({
      variables: {
        input: {
          _id: id,
          ApprovalStatus: status,
        },
      },
    }).then((res) => {
      console.log("Update Status Response shedule:", res);
     
      if (res.data?.updateReminderApprovalParent) {
        navigation.goBack();
      }
     
    });
  }
}
