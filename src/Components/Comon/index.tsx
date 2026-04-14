import { Alert, Pressable, StyleSheet, View } from "react-native";

import Modal from "react-native-modal";
import React from "react";
import Text from "../Text";
import { useTranslation } from "react-i18next";

type Props = {
  title?: string;
  titleStyle?: {};
  modalVisible: boolean;
  setModalVisible: (isVisble: boolean) => void;
  disableCancelButton?: boolean;
  customButtons?: { buttonColor?: string; title: string; disabled?: boolean; onPress: () => void }[];
};

const CustomModal = ({
  title,
  modalVisible,
  setModalVisible,
  customButtons,
  titleStyle,
  disableCancelButton,
}: Props) => {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1 }}>
      <Modal isVisible={modalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {title && (
              <View style={{ paddingVertical: 20, paddingHorizontal: 40 }}>
                <Text style={[styles.modalText, titleStyle]} lineNumber={2}>
                  {title}
                </Text>
              </View>
            )}
            {customButtons?.map((cButton, index) => {
              return (
                <Pressable
                  disabled={!!cButton?.disabled}
                  key={index.toString()}
                  style={styles.button}
                  onPress={cButton.onPress}
                >
                  <Text style={[styles.textStyle, { color: cButton?.buttonColor ?? "#333333" }]}>{cButton.title}</Text>
                </Pressable>
              );
            })}
            <Pressable
              disabled={disableCancelButton}
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.textStyle}>{t("btn.cancel")}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CustomModal;

const styles = StyleSheet.create({
  button: {
    height: 64,
    justifyContent: "center",
  },
  buttonClose: {
    backgroundColor: "#E0E0E0",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  centeredView: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  modalText: {
    color: "#333333",
    fontFamily: "Lato",
    fontSize: 16,
    textAlign: "center",
  },
  modalView: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "90%",
  },
  textStyle: {
    fontFamily: "Lato",
    fontSize: 16,
    textAlign: "center",
    alignSelf: "center",
  },
});
