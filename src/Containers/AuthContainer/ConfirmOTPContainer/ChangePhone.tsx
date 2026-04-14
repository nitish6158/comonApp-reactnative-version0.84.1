import { Alert, View } from "react-native";
import { PhoneInput, PhoneInputRef } from "@/Components/input/PhoneInput";
import React, { useState } from "react";
import { ElementButton } from "@/Components/Button/Button";
import { LabelInput } from "@/Components/input/Input";
import Text from "@Components/Text";
import { checkIfFormHasChanges } from "@Types/data";
import styles from "./styles";
import { usePhoneContext } from "@Hooks/usePhoneContext";
import { useTranslation } from "react-i18next";
import { useUpdateUserMutation } from "@Service/generated/user.generated";
import { useAppSelector } from "@/redux/Store";
import { getTimeZone } from "react-native-localize";

interface ChangePhoneProps {
  toggleDialog: () => void;
  onSubmit: () => void;
}

export const ChangePhone = ({ toggleDialog, onSubmit }: ChangePhoneProps) => {
  const me = useAppSelector(state=> state.Chat.MyProfile)
  const { phone, setPhone } = usePhoneContext();
  const [error, setError] = useState<string | undefined>();
  const phoneInput = React.useRef<PhoneInputRef>(null);
  const { t } = useTranslation();
  const [updateUser, { loading: updateLoading }] = useUpdateUserMutation();

  const handleSubmit = () => {
    const phoneNumber = phoneInput?.current?.getNumberAfterPossiblyEliminatingZero();
    const isPhoneValid = phoneInput?.current?.isValidNumber(`${phoneNumber?.formattedNumber}`);
    const isHasChanges = checkIfFormHasChanges(
      {
        phone: phoneNumber?.formattedNumber,
      },
      {
        phone: phone?.formattedNumber,
      }
    );
    if (isHasChanges) {
      if (isPhoneValid) {
        updateUser({
          variables: {
            input: {
              _id: me?._id!,
              phone: phoneNumber?.formattedNumber,
              timezone:getTimeZone()
            },
          },
        })
          .then(() => {
            setPhone(phoneNumber);
          })
          .then(() => {
            onSubmit();
          })
          .catch(() => {
            Alert.alert(t("errors.code"));
          });
      } else {
        setError(t("errors.phone"));
      }
    } else {
      toggleDialog();
    }
  };

  return (
    <View>
      <Text style={styles.subTitle}>{t("confirm.change-phone")}</Text>
      <LabelInput
        label={t("form.label.phone")}
        value={phone?.number}
        caretHidden={false}
        placeholder={t("form.label.phone")}
      >
        <PhoneInput ref={phoneInput} required error={!!error} errorMessage={error} />
      </LabelInput>
      <ElementButton
        loading={updateLoading}
        title={t("btn.save")}
        buttonStyle={styles.save}
        onPress={handleSubmit}
        disabled={updateLoading}
      />
      <ElementButton title={t("btn.cancel")} buttonStyle={styles.cancel} onPress={toggleDialog} />
    </View>
  );
};
