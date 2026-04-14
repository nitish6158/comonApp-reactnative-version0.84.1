import { Alert, Modal, Pressable, StyleSheet, View } from "react-native";

import Colors from "@/Constants/Colors";
import React from "react";
import Text from "@Components/Text";
import { useTranslation } from "react-i18next";
import { socket } from "@/redux/Reducer/SocketSlice";
import { socketConnect } from "@/utils/socket/SocketConnection";

interface DeleteModalProps {
  visible: boolean;
  setVisible: () => void;
  folderName: string;
}
const DeleteFolderModal = ({ visible, setVisible, folderName }: DeleteModalProps) => {
  const Button = ({ ButtonStyle, TitleStyle, Title, onPress }) => {
    return (
      <Pressable style={[styles.button, ButtonStyle]} onPress={onPress}>
        <Text size="sm" style={[styles.textStyle, TitleStyle]}>
          {Title}
        </Text>
      </Pressable>
    );
  };
  const { t } = useTranslation();
  return (
    <View style={styles.centeredView}>
      <Modal
        // animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => {
          Alert.alert(`${t("toastmessage.modal-has-been-closed")}`);
          setVisible(!visible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.textcontainer}>
              <Text size="lg" style={{ textAlign: "center", lineHeight: 30, marginTop: 50 }}>
                {t("folder-toastmessage.delete-message")}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", width: "70%", marginTop: 20 }}>
              <Button
                onPress={() => {
                  setVisible(!visible);
                }}
                ButtonStyle={{ backgroundColor: Colors.light.background, borderWidth: 0.5, borderColor: "red" }}
                Title="No"
                TitleStyle={{ color: "red" }}
              />
              <Button
                ButtonStyle={{ backgroundColor: Colors.light.PrimaryColor }}
                Title="Yes"
                onPress={() => {
                  setVisible(!visible);
                  socketConnect.emit("deleteFolder", { folderName: folderName });
                }}
                TitleStyle={{ color: "white" }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 2,
    elevation: 2,
    padding: 10,
    paddingHorizontal: 45,
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  centeredView: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    flex: 1,
    justifyContent: "center",
    marginTop: 0,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  modalView: {
    margin: 20,
    marginTop: "-63%",
    backgroundColor: "white",
    borderRadius: 3,
    paddingVertical: 10,

    // justifyContent:'center',
    alignItem: "center",
    width: "89%",
    height: "30%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 3,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  textStyle: {
    color: "white",
    // fontWeight: "bold",
    textAlign: "center",
  },
  textcontainer: {},
});

export default DeleteFolderModal;
