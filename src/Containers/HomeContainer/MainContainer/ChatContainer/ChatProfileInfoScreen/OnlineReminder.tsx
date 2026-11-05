import { View, Platform } from "react-native";
import React, { useState, useCallback, useMemo } from "react";
import { useAtomValue } from "jotai";
import _ from "lodash";
import { singleRoom } from "@/Atoms";
import { ItemList } from "@/Components";
import { Colors } from "@/Constants";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";
import {
  OnlineStatusFrequency,
  UserContact,
  UserContactInput,
} from "@/graphql/generated/types";
import ReminderForm from "../../ProfileContainer/contacts/ReminderForm";
import { useDispatch } from "react-redux";
import {
  useCreateContactReminderMutation,
  useRemoveContactReminderMutation,
  useUpdateContactReminderMutation,
} from "@/graphql/generated/user.generated";
import ToastMessage from "@/utils/ToastMesage";
import { setMyProfile } from "@/redux/Reducer/ChatReducer";
import { Button, Modal } from "react-native-ui-lib";
import HeaderWithAction from "@/Components/header/HeaderWithAction";

type OnlineReminderProps = {
  isReminder: UserContact | null;
};

export default function OnlineReminder({ isReminder }: OnlineReminderProps) {
  const display = useAtomValue(singleRoom);
  const { t } = useTranslation();
  const [reminderData, setReminderData] = useState<UserContact | null>(null);
  const dispatch = useDispatch();

  // GraphQL mutations
  const [createContactReminder] = useCreateContactReminderMutation();
  const [updateContactReminder] = useUpdateContactReminderMutation();
  const [removeContactReminder] = useRemoveContactReminderMutation();

  // Close modal handler
  const handleCloseModal = useCallback(() => {
    setReminderData(null);
  }, []);

  // Delete reminder handler with optimized error handling
  const handleDeleteReminder = useCallback(() => {
    if (!reminderData?._id) {
      ToastMessage(t("reminders.error-deleting"));
      return;
    }

    removeContactReminder({
      variables: {
        input: {
          _id: reminderData._id,
        },
      },
    })
      .then((res) => {
        if (res.data?.removeContactReminder) {
          setReminderData(null);
          dispatch(setMyProfile(res.data.removeContactReminder));
          ToastMessage(t("reminders.delete-success"));
        } else {
          ToastMessage(t("reminders.error-deleting"));
        }
      })
      .catch((error) => {
        console.error("Error deleting reminder:", error);
        ToastMessage(t("reminders.error-deleting"));
      });
  }, [reminderData, removeContactReminder, dispatch, t]);

  // Handle tap on reminder item - create or update
  const handleReminderPress = useCallback(() => {
    if (isReminder) {
      setReminderData(isReminder);
    } else {
      const findUser = display.participants.find(
        (e) => e.user_id !== display.currentUserUtility.user_id
      );
      if (findUser) {
        setReminderData({
          CustomMessage: `${findUser?.firstName || ""} ${findUser?.lastName || ""
            } is online.`,
          frequency: OnlineStatusFrequency.Once,
          _id: findUser?.user_id ?? "",
          firstName: findUser?.firstName ?? "",
          lastName: findUser?.lastName ?? "",
          profile_img: findUser?.profile_img ?? "",
          phone: `${findUser?.phone ?? ""}`,
        });
      }
    }
  }, [isReminder, display.participants, display.currentUserUtility.user_id]);

  // Submit handler for create/update reminder
  const handleSubmitReminder = useCallback(
    (formData: UserContactInput) => {
      const mode = isReminder ? "update" : "create";
      const updatedData = { ...reminderData, ...formData };

      if (mode === "create") {
        createContactReminder({
          variables: {
            input: { contact_reminder: updatedData },
          },
        })
          .then((res) => {
            if (res.data?.createContactReminder) {
              dispatch(setMyProfile(res.data.createContactReminder));
              ToastMessage(t("onlineStatus.reminder-success"));
            }
          })
          .catch((error) => {
            console.error("Error creating reminder:", error);
            ToastMessage(t("reminders.error-creating"));
          })
          .finally(() => {
            setReminderData(null);
          });
      } else {
        updateContactReminder({
          variables: {
            input: {
              contact_reminder: {
                _id: formData._id,
                CustomMessage: formData.CustomMessage,
                frequency: formData.frequency,
              },
            },
          },
        })
          .then((res) => {
            if (res.data?.updateContactReminder) {
              dispatch(setMyProfile(res.data.updateContactReminder));
              ToastMessage(t("onlineStatus.reminder-update"));
            }
          })
          .catch((error) => {
            console.error("Error updating reminder:", error);
            ToastMessage(t("reminders.error-updating"));
          })
          .finally(() => {
            setReminderData(null);
          });
      }
    },
    [
      isReminder,
      reminderData,
      createContactReminder,
      updateContactReminder,
      dispatch,
      t,
    ]
  );

  // Only render the component if conditions are met
  const shouldRender = useMemo(
    () =>
      display.roomType === "individual" &&
      !display.isCurrentRoomBlocked &&
      display.currentUserUtility.left_at === 0,
    [
      display.roomType,
      display.isCurrentRoomBlocked,
      display.currentUserUtility.left_at,
    ]
  );

  if (!shouldRender) {
    return null;
  }

  return (
    <View style={{ backgroundColor: 'white' }}>
      <ItemList
        Icon={
          <View
            style={{
              borderRadius: 50,
              backgroundColor: Colors.light.PrimaryColor,
              paddingHorizontal: 8,
              paddingVertical: 8,
            }}
          >
            <MaterialIcons name="online-prediction" size={18} color="white" />
          </View>
        }
        Title={t("onlineStatus.contact-reminders")}
        Count={isReminder ? "On" : "Off"}
        _onPress={handleReminderPress}
      />

      {/* Modal for creating/updating reminders */}
      <Modal visible={reminderData !== null} onDismiss={handleCloseModal}>
        <View
          style={{ flex: 1, paddingTop: Platform.OS === "android" ? 25 : 45 }}
        >
          <HeaderWithAction
            screenName={t("navigation.back")}
            onBackPress={handleCloseModal}
            isActionVisible={Boolean(isReminder)}
            ActionComponent={() => (
              <View>
                <Button
                  onPress={handleDeleteReminder}
                  label={t("reminders.delete")}
                  size="medium"
                  backgroundColor={Colors.light.alertFailure}
                />
              </View>
            )}
          />
          <ReminderForm
            contact={reminderData}
            mode={isReminder ? "update" : "create"}
            onSubmit={handleSubmitReminder}
          />
        </View>
      </Modal>
    </View>
  );
}
