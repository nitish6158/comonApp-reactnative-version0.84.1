import { useUpdateReminderMutation, useUpdateScheduleMutation } from "@/graphql/generated/reminder.generated";
import { reminder } from "@/schemas/schema";
import ToastMessage from "@/utils/ToastMesage";
import React from "react";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import Modal from "react-native-modal";

type props = {
  reminder: reminder;
  onClose: (status: "CLOSE" | "BACK") => void;
};

export default function UpdateConfirmationView({ reminder, onClose }: props) {
  const { t } = useTranslation();
  const [updateScheduleRequest] = useUpdateScheduleMutation();
  const [updateEventRequest] = useUpdateReminderMutation();
  return (
    <View>
      <Modal isVisible={reminder !== null} onBackButtonPress={closeModal} onBackdropPress={closeModal}>
        <View style={styles.main}>
          <Text style={styles.heading}>{t("reminders.update-event")}</Text>
          <TouchableOpacity style={styles.optionBox} onPress={onThisEventPressed}>
            <Text style={styles.optionText}>{t("reminders.this-event")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionBox} onPress={onAllEventPressed}>
            <Text style={styles.optionText}>{t("reminders.all-related-events")}</Text>
          </TouchableOpacity>
          <Pressable style={[styles.optionBox,styles.cancelBox]} onPress={closeModal}>
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
          ...reminder,
        },
      },
    };

    // console.log(payload);

    if (reminder?.type === "SCHEDULE") {
      updateScheduleRequest(payload)
        .then((res) => {
          if (res.data?.updateSchedule) {
            ToastMessage(t("reminders.event-schedule-updated"));
            closeAndNavigate();
          }
        })
        .catch((err) => {
          ToastMessage(t("reminders.event-schedule-update-error"));
          closeModal();
        });
    } else {
      updateEventRequest(payload)
        .then((res) => {
          if (res.data?.updateReminder) {
            ToastMessage(t("reminders.event-updated"));
            closeAndNavigate();
          }
        })
        .catch((err) => {
          ToastMessage(t("reminders.event-update-error"));
          closeModal();
        });
    }
  }

  function onAllEventPressed() {
    console.log(reminder?.type);
    const payload = {
      variables: {
        input: {
          _id: reminder?.parent_id,
          thisOccurrence: false,
          allOccurrence: true,
          ...reminder,
        },
      },
    };
    if (reminder?.type === "SCHEDULE") {
      updateScheduleRequest(payload)
        .then((res) => {
          if (res.data?.updateSchedule) {
            ToastMessage(t("reminders.events-schedule-updated"));
            closeAndNavigate();
          }
        })
        .catch((err) => {
          ToastMessage(t("reminders.events-schedule-update-error"));
          closeModal();
        });
    } else {
      updateEventRequest(payload)
        .then((res) => {
          if (res.data?.updateReminder) {
            ToastMessage(t("reminders.events-updated"));
            closeAndNavigate();
          }
        })
        .catch((err) => {
          ToastMessage(t("reminders.events-update-error"));
          closeModal();
        });
    }
  }

  function closeModal() {
    onClose("CLOSE");
  }

  function closeAndNavigate() {
    onClose("BACK");
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
  cancelBox:{
    backgroundColor:'rgba(31,31,31,.1)',
    width:'100%',
    marginTop:15,
    borderRadius:10
  }
});
