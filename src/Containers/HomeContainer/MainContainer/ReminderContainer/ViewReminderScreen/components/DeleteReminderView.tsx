import {
  useDeleteReminderMutation,
  useDeleteScheduleMutation,
} from "@/graphql/generated/reminder.generated";
import { reminder } from "@/schemas/schema";
import ToastMessage from "@/utils/ToastMesage";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from "react-native";
import Modal from "react-native-modal";

type props = {
  reminder: reminder | null;
  onClose: (reminder: reminder) => void;
  onSuccess?: () => void; // ✅ added
};

export default function DeleteReminderView({
  reminder,
  onClose,
  onSuccess,
}: props) {
  const { t } = useTranslation();
  const [deleteEventRequest] = useDeleteReminderMutation();
  return (
    <View>
      <Modal
        isVisible={reminder !== null}
        onBackButtonPress={close}
        onBackdropPress={close}
      >
        <View style={styles.main}>
          <Text style={styles.heading}>{t("reminders.delete-event")}</Text>
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
          _id: reminder?._id,
          thisOccurrence: true,
          allOccurrence: false,
        },
      },
    };
    deleteEventRequest(payload)
      .then((res) => {
        if (res.data?.deleteReminder) {
          ToastMessage(t("reminders.event-deleted"));
          onSuccess?.(); // ✅ refresh
          close();
        }
      })
      .catch((err) => {
        ToastMessage(t("reminders.event-delete-error"));
        close();
      });
  }

  function onAllEventPressed() {
    const reminderId = reminder?.parent_id || reminder?._id;
    const payload = {
      variables: {
        input: {
          _id: reminderId,
          thisOccurrence: false,
          allOccurrence: true,
        },
      },
    };
    console.log(payload);

    deleteEventRequest(payload)
      .then((res) => {
        if (res.data?.deleteReminder) {
          ToastMessage(t("reminders.events-deleted"));
          onSuccess?.(); // ✅ refresh
          close();
        }
      })
      .catch((err) => {
        ToastMessage(t("reminders.events-delete-error"));
        close();
      });
  }

  function close() {
    reminder && onClose(reminder);
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
