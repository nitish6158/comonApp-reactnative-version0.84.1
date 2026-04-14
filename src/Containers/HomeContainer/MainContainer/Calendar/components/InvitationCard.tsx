import { View, Text, Pressable, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { useAtomValue } from "jotai";
import { screenStyle as styles } from "../../ReminderContainer/ViewReminderScreen/viewReminder.styles";
import Ionicons from "react-native-vector-icons/Ionicons";

import { currentUserIdAtom } from "@/Atoms";
import dayjs from "dayjs";
import FastImage from "@d11/react-native-fast-image";
import { DefaultImageUrl } from "@Service/provider/endpoints";
import { windowWidth } from "@Util/ResponsiveView";
import Entypo from "react-native-vector-icons/Entypo";
import { Chip } from "react-native-ui-lib";
import SingleViewReminder from "../../ReminderContainer/ViewReminderScreen/components/SingleViewReminder";
import { reminder } from "@/schemas/schema";
import {
  useUpdateReminderApprovalParentMutation,
} from "@/graphql/generated/reminder.generated";
import ToastMessage from "@Util/ToastMesage";
import { useNavigation } from "@react-navigation/core";
import { useTranslation } from "react-i18next";
import { ParticipantAcceptStatus } from "@/graphql/generated/types";
import CalendarDataManipulator from "../CalendarDataManipulator";

type InvitationCardProps = {
  item: reminder;
  index: number;
};
export default function InvitationCard({ item, index }: Readonly<InvitationCardProps>) {
  const navigation = useNavigation();
  const MyProfile = useAtomValue(currentUserIdAtom);
  let currentUser = item.participants.find((v) => v._id === MyProfile?._id);
  let adminUser = item.participants.find((v) => v.role === "ADMIN");
  const [singleReminder, setSingleReminder] = useState<reminder | null>(null);
  const [updateStatusRequest, updateStatusResponse] = useUpdateReminderApprovalParentMutation();
  const { t } = useTranslation();

  return (
    <View>
      <Pressable
        onPress={() => setSingleReminder(item)}
        key={index}
        style={[styles.reminder, styles[`type_light_${item.type}`]]}
      >
        <View style={styles.icon}>
          <FastImage source={{ uri: DefaultImageUrl + adminUser?.profile_img }} style={styles.admin_profile} />
        </View>

        <View style={styles.reminder_details}>
          <View style={styles.title_container}>
            <Text style={[styles.titleText, styles[`text_${currentUser?.accepted}`]]}>{item.title}</Text>
          </View>
          <View style={styles.reminder_times}>
            <Text style={[styles.dateText, styles[`text_${currentUser?.accepted}`]]}>
              {dayjs(item.startDate).format("DD MMMM YYYY")}
            </Text>
            {item.recursive !== "ONCE" && (
              <Text style={[styles.dateText, styles[`text_${currentUser?.accepted}`]]}>
                - {dayjs(item.endDate).format("DD MMMM YYYY")}
              </Text>
            )}
            <Text style={[styles.timeText, styles[`text_${currentUser?.accepted}`]]}>
              | {dayjs(item.time).format("HH:mm")}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: windowWidth - 75,
              // justifyContent: "space-between",
            }}
          >
            <View style={[styles.recurrent, styles[`type_box_${item.type}`]]}>
              <Text style={styles.recurrentText}>{t(`reminders.${item.recursive?.toLowerCase()}`)}</Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={styles.participantIcon}>
                <Ionicons
                  name="people"
                  size={18}
                  color={styles[`type_text_${item.type}`].color}
                  style={{ marginRight: 5 }}
                />
                <Text>{item.participants.length}</Text>
              </View>

              {item.attachment && item.attachment.length > 0 && (
                <View style={styles.participantIcon}>
                  <Entypo
                    name="attachment"
                    size={16}
                    color={styles[`type_text_${item.type}`].color}
                    style={{ marginLeft: 12, marginRight: 5 }}
                  />
                  <Text>{item.attachment.length}</Text>
                </View>
              )}
              {item.approvalReminderTime && item.approvalReminderTime.length > 0 && (
                <View style={[styles.participantIcon, { marginHorizontal: 5 }]}>
                  {currentUser?.accepted === ParticipantAcceptStatus['Pause'] && (
                    <Ionicons name="notifications-off-sharp" size={16} color={styles[`type_text_${item.type}`].color} />
                  )}

                  {(currentUser?.accepted === ParticipantAcceptStatus["Accept"] ||
                    currentUser?.accepted === ParticipantAcceptStatus["Reject"]) && (
                    <Ionicons name="notifications" size={16} color={styles[`type_text_${item.type}`].color} />
                  )}
                  {currentUser?.accepted === ParticipantAcceptStatus["Pending"] && (
                    <Ionicons name="notifications-outline" size={16} color={styles[`type_text_${item.type}`].color} />
                  )}
                  <Text style={{ marginLeft: 2 }}>{item.approvalReminderTime.length}</Text>
                </View>
              )}
              {item.location && (
                <Ionicons name="location-sharp" size={18} color="red" style={{ marginHorizontal: 3 }} />
              )}
            </View>
          </View>

          {!updateStatusResponse.loading ? (
            <View style={{ alignSelf: "flex-end", flexDirection: "row", marginTop: 1 }}>
              {currentUser?.role !== "ADMIN" && currentUser?.accepted == ParticipantAcceptStatus["Pending"] ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Chip
                    label={t("reminders.accept")}
                    onPress={() => updateStatus(ParticipantAcceptStatus["Accept"], item.parent_id)}
                  />
                  <View style={{ width: 5 }} />
                  <Chip
                    label={t("reminders.reject")}
                    onPress={() => updateStatus(ParticipantAcceptStatus["Reject"], item.parent_id)}
                  />
                </View>
              ) : (
                <></>
              )}
            </View>
          ) : (
            <ActivityIndicator style={{ alignSelf: "flex-end" }} />
          )}
        </View>
      </Pressable>
      <SingleViewReminder reminder={singleReminder} onClose={() => setSingleReminder(null)} onDelete={()=>{}} onStatusChange={()=>{}} />
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
       console.log("Update Status Response event :", res);
     
      if (res.data?.updateReminderApprovalParent) {
        if (status == ParticipantAcceptStatus["Accept"]) {
          ToastMessage(t("reminders.event-added-to-calendar-successfully"));
        }
        navigation.goBack();
      }
     
    });
  }
}
