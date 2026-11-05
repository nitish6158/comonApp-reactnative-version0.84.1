import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import CommonHeader from "@Components/header/CommonHeader";
import { Colors, fonts } from "@/Constants";
import { useTranslation } from "react-i18next";
import { Switch } from "react-native-ui-lib";
import {
  useUpdateChatroomReadReceiptsMutation,
  useUpdateGlobalReadReceiptsMutation,
} from "@/graphql/generated/room.generated";
import ToastMessage from "@Util/ToastMesage";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/Reducer";
import { PrivacyProps } from "@/navigation/screenPropsTypes";
import { socket } from "@/redux/Reducer/SocketSlice";
import { useAppSelector } from "@/redux/Store";

export default function Privacy(props: PrivacyProps) {
  const { route } = props;
  const chatRoomId = route.params?.chatRoomId;
  const status = route.params?.status;
  const [loading, setLoading] = useState(false);
  const [readReceiptsStatus, setReadReceiptsStatus] = useState(false);

  const [updateGlobalReadReceipts] = useUpdateGlobalReadReceiptsMutation();
  const [updateChatRoomReadReceipts] = useUpdateChatroomReadReceiptsMutation();

  const { MyProfile } = useAppSelector((state) => state.Chat);

  const { t } = useTranslation();

  useEffect(() => {
    if (!chatRoomId) {
      if (MyProfile?.receipts != readReceiptsStatus) setReadReceiptsStatus(MyProfile?.receipts ?? false);
    } else {
      if (typeof status == "boolean") {
        setReadReceiptsStatus(status);
      }
    }
  }, [MyProfile?.receipts]);

  function handlePressToggle() {
    setReadReceiptsStatus(!readReceiptsStatus);
    setLoading(!loading);
    if (chatRoomId) {
      updateChatRoomReadReceipts({
        variables: {
          input: {
            _id: chatRoomId,
            action: !readReceiptsStatus,
          },
        },
      })
        .then((response) => {
          if (response.errors) {
            console.error("Error in updating chat room read receipts from response first callback", response.errors);
            setLoading(false);
            ToastMessage(t("errorInUpdatingGlobalReceipt"));
            return;
          }
          setLoading(false);
          ToastMessage(t("updatedReceiptsChatRoom"));
        })
        .catch((err) => {
          console.error("Error in updating chat room read receipts", err);
          setLoading(false);
          ToastMessage(t("errorInUpdatingGlobalReceipt"));
        });
    } else {
      updateGlobalReadReceipts({
        variables: {
          input: {
            action: !readReceiptsStatus,
          },
        },
      })
        .then((response) => {
          if (response.errors) {
            console.error("Error in updating global read receipts", response.errors);
            setLoading(false);
            ToastMessage(t("errorInUpdatingGlobalReceipt"));
            return;
          }
          if (socket?.connected) {
            socket?.emit("getProfile");
          }
          setLoading(false);
          ToastMessage(t("updatedReceiptsGlobally"));
        })
        .catch((err) => {
          console.log("Error in updating global read receipts", err);
          setLoading(false);
          ToastMessage(t("errorInUpdatingGlobalReceipt"));
        });
    }
  }

  return (
    <>
      <CommonHeader title={t("privacy")} />
      <View style={styles.container}>
        <View style={[styles.rowDirection, { justifyContent: "space-between" }]}>
          <View style={{ width: "80%" }}>
            <Text style={[styles.textTypo, styles.headingTextStyle]}>{t("readReceipts")}</Text>
            <Text style={[styles.textTypo, styles.descriptionTextStyle]}>{t("receiptsMessage")}</Text>
          </View>
          {loading ? (
            <ActivityIndicator size={15} color={Colors.light.PrimaryColor} />
          ) : (
            <Switch value={readReceiptsStatus} onValueChange={handlePressToggle} onColor={Colors.light.PrimaryColor} />
          )}
        </View>

        {chatRoomId && (
          <View style={{ marginVertical: 40, alignItems: "center", justifyContent: "center", opacity: 0.5 }}>
            <Text style={{ textAlign: "center" }}>{t("label.recept-message")}</Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.White,
    padding: 20,
  },
  textTypo: {
    fontFamily: fonts.Lato,
    fontStyle: "normal",
  },
  headingTextStyle: {
    fontSize: 17,
    lineHeight: 20,
    color: Colors.light.black,
    fontWeight: "700",
    marginBottom: 5,
  },
  descriptionTextStyle: {
    fontSize: 15,
    lineHeight: 17,
    color: Colors.light.black,
  },
  rowDirection: {
    flexDirection: "row",
    // alignItems: "center",
  },
});
