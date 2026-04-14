import { Pressable, StyleSheet, View } from "react-native";
//import liraries
import React, { Component } from "react";

import Audio from "@Images/Audio.svg";
import Gif from "@Images/Gif.svg";
import Link from "@Images/Link.svg";
import Photos from "@Images/Photos.svg";
import Text from "@Components/Text";
import Video from "@Images/Video.svg";
import { useTranslation } from "react-i18next";

// create a component
const TypeSelection = () => {
  const { t } = useTranslation();
  const TypeList = [
    {
      Title: `${t("moreOption.photos")}`,
      Image: <Photos />,
    },
    {
      Title: `${t("moreOption.gif")}`,
      Image: <Gif />,
    },
    {
      Title: `${t("navigation.Links")}`,
      Image: <Link />,
    },
    {
      Title: `${t("moreOption.videos")}`,
      Image: <Video />,
    },
    {
      Title: `${t("moreOption.audio")}`,
      Image: <Audio />,
    },
  ];
  return (
    <>
      {TypeList.map((item) => {
        return (
          <Pressable style={styles.TypeContainer} key={item.Title}>
            <View style={styles.Image}>{item.Image}</View>
            <Text style={styles.Title}>{item.Title}</Text>
          </Pressable>
        );
      })}
    </>
  );
};

// define your styles
const styles = StyleSheet.create({
  Image: { width: 60 },
  Title: { textAlign: "right" },
  TypeContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginLeft: 20,
    marginVertical: 18,
    width: 115,
  },
});

//make this component available to the app
export default TypeSelection;
