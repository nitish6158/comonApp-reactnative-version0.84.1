/* eslint-disable react-native/no-inline-styles */
import * as React from "react";

import { Alert, Pressable } from "react-native";
import { useConfirmAccountDeleteMutation, useRequestAccountDeleteLazyQuery } from "@Service/generated/auth.generated";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { CodeInput } from "../input/CodeInput";
import Colors from "@/Constants/Colors";
import { DeadlineStorageKeys } from "@Util/storage";
import { Dialog } from "react-native-elements";
import { ElementButton } from "../Button/Button";
import Text from "../Text";
import styles from "./style";
import { useStorageDedline } from "@Hooks/useStorageDedline";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { removeCurrentOrganization } from "@/utils/session";
import { useDispatch } from "react-redux";
import { resetContactState } from "@/redux/Reducer/ContactReducer";
import { resetCallState } from "@/redux/Reducer/CallReducer";
import { resetChatState, setMyProfile } from "@/redux/Reducer/ChatReducer";

export default function RemoveProfile() {
  const [visible, setVisible] = React.useState(false);
  const [value, setValue] = React.useState<string>("");
  const dispatch = useDispatch()
  const { t } = useTranslation();
  const { onResend, isCanResend, dedline } = useStorageDedline({
    storageKey: DeadlineStorageKeys.TIME_TO_RESEND_DELETE_ACCOUNT_SMS,
  });

  const [requestAccountDelete, { loading: requestAccountDeleteLoading, called }] = useRequestAccountDeleteLazyQuery();
  const [confirmAccountDelete, { loading: confirmAccountDeleteLoading }] = useConfirmAccountDeleteMutation();

  const onRemove = () => {
    confirmAccountDelete({ variables: { input: { code: value } } })
      .then(() => {
        setValue("");
        toggleDialog();
      })
      .then(async () => {
        console.log("Global logout onLogout");


        await AsyncStorage.removeItem("me");
    
        removeCurrentOrganization();
        dispatch(resetContactState());
        dispatch(resetCallState());
        dispatch(resetChatState());
        dispatch(setMyProfile(null));
      })
      .catch(() => {
        Alert.alert(t("errors.code"));
      });
  };

  const onRequest = () => {
    requestAccountDelete().then(() => {
      setValue("");
      onResend();
    });
  };

  const toggleDialog = () => {
    setVisible(!visible);
  };

  return (
    <>
      <Pressable style={{ flexDirection: "row", alignItems: "center", marginVertical: 5 }} onPress={toggleDialog}>
        <MaterialCommunityIcons name="delete-outline" size={24} color={Colors.light.PrimaryColor} style={{ marginRight: 10, marginLeft: 5 }} />
        <Text style={{ fontSize: 17 }}>{t("navigation.remove")}</Text>
      </Pressable>

      <Dialog isVisible={visible} onBackdropPress={toggleDialog} overlayStyle={{ width: "95%" }}>
        <Dialog.Title title={t("remove-profile.title")} titleStyle={styles.removeTitle} />
        {called ? (
          <>
            <Text>{t("remove-profile.input")}</Text>
            <CodeInput onChangeText={setValue} />
            <ElementButton
              disabled={called && value.length < 4}
              title={t("remove-profile.remove")}
              buttonStyle={styles.remove}
              onPress={onRemove}
              loading={confirmAccountDeleteLoading}
            />
          </>
        ) : undefined}
        <ElementButton
          loading={requestAccountDeleteLoading}
          title={
            isCanResend
              ? !called
                ? t("remove-profile.yes")
                : t("remove-profile.resend")
              : t("confirm.countdown", { sec: dedline })
          }
          buttonStyle={styles.resend}
          onPress={onRequest}
          disabled={!isCanResend}
        />
        <ElementButton title={t("btn.cancel")} buttonStyle={styles.cancel} onPress={toggleDialog} />
      </Dialog>
    </>
  );
}
