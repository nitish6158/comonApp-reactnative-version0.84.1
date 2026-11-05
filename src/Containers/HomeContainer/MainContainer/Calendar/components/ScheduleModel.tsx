import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import React, { useMemo } from "react";
import Modal from "react-native-modal";
import { reminder } from "@/schemas/schema";
import { capitalize } from "lodash";
import { useTranslation } from "react-i18next";
import { useAtomValue, useSetAtom } from "jotai";
import { AllChatRooms } from "@/Atoms";
import FastImage from "@d11/react-native-fast-image";
import { DefaultImageUrl } from "@/graphql/provider/endpoints";
import dayjs from "dayjs";
import { screenStyle as reminderStyle } from "../../ReminderContainer/ViewReminderScreen/viewReminder.styles";
import MessageCommon from "../../ChatContainer/ScheduleMessages/ViewScheduleMessage/components/MessageCommon";
import docIcon from "@Assets/images/docs";
import { useNavigation } from "@react-navigation/core";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Colors } from "@/Constants";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
  renderers,
} from "react-native-popup-menu";
import Feather from "react-native-vector-icons/Feather";
import {
  EventType,
  ParticipantAcceptStatus,
  RecurrentTypes,
} from "@/graphql/generated/types";
import {
  useDeleteReminderMutation,
  useDeleteScheduleMutation,
  useUpdateReminderApprovalStatusMutation,
} from "@/graphql/generated/reminder.generated";
import { Chip } from "react-native-ui-lib";
import ToastMessage from "@/utils/ToastMesage";
import { useAppSelector } from "@/redux/Store";
import { DocumentPreview } from "@/Components";
import { calendarRefreshAtom } from "@/Atoms/CalendarAtom";

type statusPayload = {
  reminder: reminder;
  status: ParticipantAcceptStatus;
  title: string;
};

type ScheduleModelProps = {
  event: reminder;
  onClose: () => void;
  onDelete: (reminder: reminder) => void;
  onStatusChanged: (event: statusPayload) => void;
};

export default function ScheduleModel({
  event,
  onClose,
  onDelete,
  onStatusChanged,
}: ScheduleModelProps) {
  const { t } = useTranslation();
  const chatRooms = useAtomValue(AllChatRooms);
  const navigation = useNavigation();
  const [updateParticipantStatus] = useUpdateReminderApprovalStatusMutation();
  const [deleteEventRequest] = useDeleteReminderMutation();
  const triggerCalendarRefresh = useSetAtom(calendarRefreshAtom);

  const currentRoom = useMemo(() => {
    return chatRooms.find((v) => v._id === event.roomId);
  }, [event.roomId]);

  const messages = useMemo(() => (Array.isArray(event?.message) ? event.message : []), [event?.message]);

  const messageTypeText = useMemo(() => {
    let typeList = [] as Array<{ type: string; count: number }>;

    messages.forEach((v) => {
      if (!typeList.find((b) => v.type == b.type)) {
        typeList.push({ type: v.type, count: 1 });
      } else {
        typeList = typeList.map((b) => {
          if (b.type == v.type) {
            return { ...b, count: b.count + 1 };
          } else {
            return b;
          }
        });
      }
    });

    if (typeList.length === 0) return ["1 Message"];

    let text = typeList.map(
      (v, vi) =>
        `${typeList.length > 1 ? (vi > 0 ? "," : "") : ""} ${
          v.count
        } ${capitalize(v.type)}`,
    );

    return text;
  }, [messages]);

  const isFutureEvent = dayjs(event.date).isSameOrAfter(dayjs(), "minutes");

  if (!currentRoom) {
    return <></>;
  }
  return (
    <View>
      <Modal
        isVisible={event != null}
        onBackButtonPress={onClose}
        onBackdropPress={onClose}
      >
        <View style={styles.background}>
          <View style={styles.main}>
            <FastImage
              style={{
                height: 25,
                width: 25,
                borderRadius: 30,
                marginRight: 10,
              }}
              source={{
                uri: `${DefaultImageUrl}${currentRoom.display.UserImage}`,
              }}
            />
            <Text>{currentRoom.display.UserName}</Text>
          </View>
          <View style={styles.message}>
            <Text style={{ fontSize: 14 }}>
              {messageTypeText} {t("reminders.message-scheduled")}
            </Text>
          </View>

          <View
            style={{
              marginLeft: 5,
              marginTop: 8,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={[
                reminderStyle.dateText,
                reminderStyle[`text_${event.currentUser?.accepted}`],
              ]}
            >
              {dayjs(event.date).format("DD MMMM YYYY")}
            </Text>

            <Text
              style={[
                reminderStyle.timeText,
                reminderStyle[`text_${event.currentUser?.accepted}`],
              ]}
            >
              |{" "}
              {event.isAllDay
                ? t("all_day") + " "
                : dayjs(event.time).format("HH:mm")}
            </Text>
          </View>
          <View style={{ maxHeight: 350, marginTop: 10 }}>
            <FlatList
              data={messages}
              numColumns={3}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => {
                return (
                  <View
                    key={index}
                    style={{
                      alignSelf: "flex-end",
                      backgroundColor: "#F1F1F1",
                      paddingHorizontal: 10,
                      paddingVertical: 10,
                      borderRadius: 5,
                    }}
                  >
                    <MessageCommon
                      message={item.type === "text" ? item.message : ""}
                    >
                      <View>
                        {item.type === "DOCUMENT" && (
                          // <View
                          //   style={{
                          //     marginHorizontal: 5,
                          //     flexDirection: "row",
                          //     alignItems: "center",
                          //     backgroundColor: "rgba(243,243,243,1)",
                          //     marginBottom: 5,
                          //   }}
                          // >
                          //   <View
                          //     style={{
                          //       backgroundColor: "white",
                          //       paddingHorizontal: 5,
                          //       paddingVertical: 5,
                          //       borderRadius: 5,
                          //       justifyContent: "center",
                          //       alignItems: "center",
                          //     }}
                          //   >
                          //     <FastImage source={docIcon.doc} style={{ width: 30, height: 30 }} />
                          //   </View>
                          //   <Text style={{ fontSize: 12, marginHorizontal: 10, width: 80 }}>
                          //     {item.fileURL?.split("/").pop()}
                          //   </Text>
                          // </View>
                          <DocumentPreview item={item} />
                        )}
                        {item.type === "IMAGE" && (
                          <Pressable
                            onPress={() => {
                              navigation.navigate("ViewScheduleAttachment", {
                                type: "image",
                                url: `${DefaultImageUrl}${item.fileURL}`,
                                caption: item.message ?? "",
                              });
                              onClose();
                            }}
                          >
                            <FastImage
                              source={{
                                uri: `${DefaultImageUrl}${item.fileURL}`,
                              }}
                              style={styles.imageStyle}
                            />
                          </Pressable>
                        )}
                        {item.type === "VIDEO" && (
                          <Pressable
                            onPress={() => {
                              navigation.navigate("ViewScheduleAttachment", {
                                type: "video",
                                url: `${DefaultImageUrl}${item.fileURL}`,
                                caption: item.message ?? "",
                              });
                              onClose();
                            }}
                          >
                            <FastImage
                              source={{
                                uri: `${DefaultImageUrl}${item.thumbnail}`,
                              }}
                              style={styles.imageStyle}
                            >
                              <View style={styles.videoPlayButton}>
                                <Ionicons
                                  name="ios-play-sharp"
                                  size={30}
                                  color="white"
                                />
                              </View>
                            </FastImage>
                          </Pressable>
                        )}
                      </View>
                    </MessageCommon>
                  </View>
                );
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              marginTop: 10,
            }}
          >
            {event.isApprovalNeeded && isFutureEvent && (
              <View
                style={{
                  borderRightColor: "gray",
                  borderRightWidth: 1,
                  paddingRight: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <Chip
                    label={t("reminders.approve")}
                    onPress={() => {
                      if (event) {
                        const isNonOnce =
                          event.recursive !== RecurrentTypes["Once"];
                        if (isNonOnce) {
                          onStatusChanged({
                            reminder: event,
                            status: ParticipantAcceptStatus["Accept"],
                            title: t("reminders.update-message-status"),
                          });
                        } else {
                          const payload = {
                            variables: {
                              input: {
                                _id: event?._id,
                                ApprovalStatus:
                                  ParticipantAcceptStatus["Accept"],
                              },
                            },
                          };
                          updateParticipantStatus(payload)
                            .then((res) => {
                              if (res.data?.updateReminderApprovalStatus) {
                                ToastMessage(t("reminders.event-status-change"));
                                triggerCalendarRefresh((v) => v + 1);
                                onClose()
                              }
                            })
                            .catch((err) => {
                              ToastMessage(
                                t("reminders.event-status-change-error"),
                              );
                              onClose();
                            });
                        }
                      }
                    }}
                  />
                  <View style={{ width: 5 }} />
                  <Chip
                    label={t("reminders.reject")}
                    onPress={() => {
                      if (event) {
                        const isNonOnce =
                          event.recursive !== RecurrentTypes["Once"];
                        if (isNonOnce) {
                          onStatusChanged({
                            reminder: event,
                            status: ParticipantAcceptStatus["Reject"],
                            title: t("reminders.update-message-status"),
                          });
                        } else {
                          const payload = {
                            variables: {
                              input: {
                                _id: event?._id,
                                ApprovalStatus:
                                  ParticipantAcceptStatus["Reject"],
                              },
                            },
                          };
                          updateParticipantStatus(payload)
                            .then((res) => {
                              if (res.data?.updateReminderApprovalStatus) {
                                ToastMessage(t("reminders.event-status-change"));
                                triggerCalendarRefresh((v) => v + 1);
                                onClose();
                              }
                            })
                            .catch((err) => {
                              ToastMessage(
                                t("reminders.event-status-change-error"),
                              );
                              onClose();
                            });
                        }
                      }
                    }}
                  />
                </View>

                {event?.participants?.[0]?.accepted === ParticipantAcceptStatus["Reject"] && (
                  <Chip
                    label={t("reminders.reject")}
                    labelStyle={{ color: "red" }}
                    containerStyle={{ borderColor: "red" }}
                  />
                )}
              </View>
            )}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
                marginLeft: 10,
              }}
            >
              {isFutureEvent && (
                <Chip label={t("reminders.change")} onPress={onUpdatePressed} />
              )}
              <View style={{ width: 5 }} />
              <Chip
                containerStyle={{ borderColor: "red" }}
                labelStyle={{ color: "red" }}
                label={t("reminders.delete")}
                onPress={onDeletePressed}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  function onDeletePressed() {
    if (event) {
      const isNonOnce = event.recursive !== RecurrentTypes["Once"];
      if (isNonOnce) {
        onDelete(event);
      } else {
        const payload = {
          variables: {
            input: {
              _id: event?._id,
              thisOccurrence: true,
              allOccurrence: false,
            },
          },
        };
        deleteEventRequest(payload)
          .then((res) => {
            if (res.data?.deleteReminder) {
              ToastMessage(t("reminders.event-deleted"));
              triggerCalendarRefresh((v) => v + 1);
              onClose();
            }
          })
          .catch((err) => {
            ToastMessage(t("reminders.event-delete-error"));
            onClose();
          });
      }
    }
  }

  function onUpdatePressed() {
    onClose();
    navigation.navigate("CreateScheduleMessage", {
      mode: "update",
      ...event,
    });
  }
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: "white",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  videoPlayButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 35,
    height: 42,
    justifyContent: "center",
    marginTop: 40,
    position: "absolute",
    width: 42,
  },
  imageStyle: {
    height: 110,
    width: 90,
    borderRadius: 10,
    marginBottom: 10,
  },
  main: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#A7E6FF",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  message: {
    marginTop: 5,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
  },
});
