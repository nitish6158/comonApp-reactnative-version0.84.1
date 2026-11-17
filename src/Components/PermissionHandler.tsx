import React from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

interface IPermissionHandler {
  type: "contact" | "media";
  handlePressAgree: Function;
  handlePressCancel?: Function;
  t: any;
}

export default function PermissionHandler(props: IPermissionHandler) {
  let title = "";
  let description = "";
  switch (props.type) {
    case "contact":
      title = props.t("accessPermission");
      description = props.t("contactDisclosure");
      break;
    case "media":
      title = props.t("mediaConsent");
      description = props.t("mediaDisclosure");
      break;
    default:
      break;
  }
  return Alert.alert(title, description, [
    {
      text: "Not Now",
      onPress: () => {
        props.handlePressCancel?.();
        console.log("Cancel Pressed");
      },
      style: "cancel",
    },
    {
      text: "Allow Access",
      onPress: () => {
        props.handlePressAgree(props.type);
      },
    },
  ]);
}
