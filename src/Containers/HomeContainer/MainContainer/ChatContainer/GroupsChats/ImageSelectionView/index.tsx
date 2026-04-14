import { Pressable, StyleSheet, View } from "react-native";

import CameraSvg from "@Images/CreateGroup/camera.svg";
import Colors from "@/Constants/Colors";
import ImagePicker from "react-native-image-crop-picker";
import Picture from "@Images/CreateGroup/picture.svg";
/* eslint-disable react-native/no-color-literals */
//import liraries
import React from "react";

// create a component

const ImageSelectionView = ({ setGroupIcon, GroupImage }) => {
  const onOpenCamera = async () => {
    ImagePicker.openCamera({
      width: 300,
      height: 300,
      cropping: true,
    })
      .then((ima) => {
        const ImageData = [ima];
        setGroupIcon(ImageData);
      })
      .catch((error) => {});
  };
  const ImagePickers = async () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
    })
      .then((ima) => {
        // //console.log("qwerty", ima);
        const ImageData = [ima];
        setGroupIcon(ImageData);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const listitem = [<CameraSvg />, <Picture />];
  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <View style={styles.primaryCon}>
      {listitem.map((item, index) => {
        return (
          <Pressable
            style={styles.container}
            key={index}
            onPress={() => {
              if (index == 0) {
                onOpenCamera();
              }
              if (index == 1) {
                ImagePickers();
              }
            }}
          >
            {item}
          </Pressable>
        );
      })}
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: Colors.light.LightBlue,
    borderRadius: 4,
    height: 64,
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 20,
    width: 64,
  },
  primaryCon: { alignItems: "center", flexDirection: "row", justifyContent: "center", marginHorizontal: 20 },
});

//make this component available to the app
export default ImageSelectionView;
