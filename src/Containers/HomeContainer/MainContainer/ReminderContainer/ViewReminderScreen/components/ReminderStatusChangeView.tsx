import {
  useUpdateReminderApprovalParentMutation,
  useUpdateReminderApprovalStatusMutation,
} from "@/graphql/generated/reminder.generated";
import { ParticipantAcceptStatus } from "@/graphql/generated/version.generated";
import { reminder } from "@/schemas/schema";
import ToastMessage from "@/utils/ToastMesage";
import React from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native";
import { Pressable } from "react-native";
import { View, Text, StyleSheet } from "react-native";
import Modal from "react-native-modal";

type props = {
  event: {
    reminder: reminder;
    status: ParticipantAcceptStatus;
    title: string;
  } | null;
  onClose: (reminder: reminder) => void;
  onSuccess?: () => void; // ✅ added
};

export default function ReminderStatusChangeView({
  event,
  onClose,
  onSuccess,
}: props) {
  const [updateParentStatus] = useUpdateReminderApprovalParentMutation();
  const [updateChildStatus] = useUpdateReminderApprovalStatusMutation();
  const { t } = useTranslation();
  return (
    <View>
      <Modal
        isVisible={event !== null}
        onBackButtonPress={close}
        onBackdropPress={close}
      >
        <View style={styles.main}>
          <Text style={styles.heading}>{event?.title}</Text>
          <TouchableOpacity
            style={styles.optionBox}
            onPress={onThisEventPressed}
          >
            <Text style={styles.optionText}>{t("reminders.this-event")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionBox}
            onPress={onAllEventPressed}
          >
            <Text style={styles.optionText}>
              {t("reminders.all-related-events")}
            </Text>
          </TouchableOpacity>
          <Pressable
            style={[styles.optionBox, styles.cancelBox]}
            onPress={close}
          >
            <Text style={styles.cancleText}>{t("btn.cancel")}</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );

  function onThisEventPressed() {
    const payload = {
      variables: {
        input: {
          _id: event?.reminder._id,
          ApprovalStatus: event?.status,
        },
      },
    };

    updateChildStatus(payload)
      .then((res) => {
        if (res.data?.updateReminderApprovalStatus) {
          ToastMessage(t("reminders.event-status-change"));
          onSuccess?.(); // ✅ refresh
          close();
        }
      })
      .catch((err) => {
        ToastMessage(t("reminders.event-status-change-error"));
        close();
      });
  }

  function onAllEventPressed() {
    const payload = {
      variables: {
        input: {
          _id: event?.reminder.parent_id,
          ApprovalStatus: event?.status,
        },
      },
    };

    updateParentStatus(payload)
      .then((res) => {
        if (res.data?.updateReminderApprovalParent) {
          ToastMessage(t("reminders.events-status-change"));
          onSuccess?.(); // ✅ refresh
          close();
        }
      })
      .catch((err) => {
        ToastMessage(t("reminders.events-status-change-error"));
        close();
      });
  }

  function close() {
    event?.reminder && onClose(event.reminder);
  }
}

const styles = StyleSheet.create({
  main: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginHorizontal: 10,
    borderRadius: 15,
  },
  heading: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 20,
  },
  optionBox: {
    paddingVertical: 10,
  },
  optionText: {
    textAlign: "center",
    fontSize: 15,
  },
  cancleText: {
    color: "red",
    textAlign: "center",
  },
  cancelBox: {
    backgroundColor: "rgba(31,31,31,.1)",
    width: "100%",
    marginTop: 15,
    borderRadius: 10,
  },
});
