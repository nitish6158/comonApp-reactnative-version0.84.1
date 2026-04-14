import { DefaultImageUrl, ImageUrl } from "@Service/provider/endpoints";
import { Image, LogBox, StyleSheet, Text, View } from "react-native";
//import liraries
import React, { Component } from "react";
import { windowHeight, windowWidth } from "@Util/ResponsiveView";

import Colors from "@/Constants/Colors";
import SelectGroupIcon from "@Images/CreateGroup/SelectGroupIcon.svg";
import { isEmpty } from "lodash";
import FastImage from "@d11/react-native-fast-image";

const EditProfileImage = ({ groupImage, OldImage, UpdateProfile }: any) => {
  return (
    <View style={styles.container}>
      {!UpdateProfile ? (
        isEmpty(groupImage) ? (
          <SelectGroupIcon />
        ) : (
          <FastImage
            source={{ uri: groupImage[0]?.path }}
            style={{ height: "100%", width: "100%" }}
            resizeMode="cover"
          />
        )
      ) : (
        <FastImage
          source={{ uri: isEmpty(groupImage) ? `${DefaultImageUrl}${OldImage}` : groupImage[0]?.path }}
          style={{ height: "100%", width: "100%" }}
          resizeMode="cover"
        />
      )}
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  // eslint-disable-next-line react-native/no-color-literals
  container: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 300,
    height: 150,
    justifyContent: "center",
    marginTop: windowHeight / 40,
    overflow: "hidden",
    width: 150,
  },
});

//make this component available to the app
export default EditProfileImage;
