import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import AntDesign from "react-native-vector-icons/AntDesign";
import Colors from "@/Constants/Colors";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import React from "react";
import fonts from "@/Constants/fonts";

interface IMedia {
  modal: boolean;
  setModal: Function;
  onPressCamera: Function;
  onPressGallery: Function;
  disableCamera?: boolean;
  disableGallery?: boolean;
}

export function MediaPopup(props: IMedia) {
  const { modal, setModal, onPressCamera, onPressGallery, disableCamera, disableGallery } = props;
  return (
    <View style={style.halfModalContainer}>
      <Modal animationType="slide" transparent={true} visible={modal} onRequestClose={() => setModal(false)}>
        <TouchableOpacity activeOpacity={1} style={style.halfModalContainer}>
          <View style={style.modalView}>
            <View style={[style.rowDirection, { justifyContent: "space-between" }]}>
              <TouchableOpacity
                style={style.buttonContainer}
                activeOpacity={0.7}
                onPress={() => onPressCamera()}
                disabled={disableCamera}
              >
                <AntDesign name="camera" size={45} color={Colors.light.PrimaryColor} />
                <Text style={[style.textTypo, style.buttonTextStyle]}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={style.buttonContainer}
                activeOpacity={0.7}
                onPress={() => onPressGallery()}
                disabled={disableGallery}
              >
                <FontAwesome5 name="photo-video" size={45} color={Colors.light.PrimaryColor} />
                <Text style={[style.textTypo, style.buttonTextStyle]}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const style = StyleSheet.create({
  buttonContainer: { alignItems: "center", height: 50, justifyContent: "center", width: 50 },
  buttonTextStyle: {
    color: Colors.light.black,
    fontSize: 13,
    fontWeight: "500",
    paddingTop: 5,
  },
  halfModalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    marginTop: 10,
    paddingHorizontal: 5,
  },
  modalView: {
    height: "20%",
    backgroundColor: Colors.light.White,
    padding: 55,
    borderRadius: 8,
    shadowColor: Colors.light.black,
    shadowOffset: {
      width: 0,
      height: -10,
    },
    // shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 20,
  },
  rowDirection: { alignItems: "center", flexDirection: "row" },
  textTypo: {
    fontFamily: fonts.Lato,
    fontStyle: "normal",
  },
});
