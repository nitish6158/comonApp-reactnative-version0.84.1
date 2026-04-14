import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";

import Colors from "@/Constants/Colors";
import Modal from "react-native-modal";
import React from "react";
import Text from "../Text";
import { useTranslation } from "react-i18next";

type Props = {
  title?: string;
  titleStyle?: {};
  modalVisible: boolean;
  setModalVisible: (isVisble: boolean) => void;
  customButtons?: { buttonColor?: string; title: string; disabled?: boolean; onPress: () => void }[];
  positiveButton?: () => void;
};

const CustomButton = ({ borderless, title, onPress }: any) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          width: "38%",
          height: 45,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 50,
          backgroundColor: Colors.light.PrimaryColor,
        },
        borderless && styles.borderCon,
      ]}
    >
      <Text style={{ color: !borderless ? Colors.light.White : Colors.light.red }}>{title}</Text>
    </TouchableOpacity>
  );
};

const CustomModal2 = ({ title, modalVisible, setModalVisible, customButtons, titleStyle, positiveButton }: Props) => {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1 }}>
      <Modal isVisible={modalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {title && (
              <View style={{ paddingVertical: 20, paddingHorizontal: 20 }}>
                <Text style={{ textAlign: "center", fontSize: 14 }} lineNumber={7}>
                  {t("delete-chat.message")}
                </Text>
              </View>
            )}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                marginTop: "7%",
                marginBottom: 20,
                borderRadius: 30,
              }}
            >
              <CustomButton title={t("chatProfile.no")} onPress={() => setModalVisible(false)} />

              <CustomButton borderless title={t("chatProfile.yes")} onPress={positiveButton} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CustomModal2;

const styles = StyleSheet.create({
  borderCon: {
    backgroundColor: "transparent",
    borderColor: Colors.light.red,
    borderWidth: 1,
  },
  button: {
    height: 64,
    justifyContent: "center",
  },
  buttonClose: {
    backgroundColor: "#E0E0E0",
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  centeredView: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",

    flex: 1,
    justifyContent: "center",
  },
  modalText: {
    color: "#333333",
    fontFamily: "Lato",
    fontSize: 18,
    textAlign: "center",
  },
  modalView: {
    backgroundColor: "#fff",
    borderRadius: 15,
    width: "90%",
  },
  textStyle: {
    fontFamily: "Lato",
    fontSize: 16,
    textAlign: "center",
  },
});
