//import liraries
import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";

import AvtaarWithoutTitle from "@Components/AvtaarWithoutTitle";
import { DefaultImageUrl } from "@Service/provider/endpoints";
import moment from "moment-timezone";

// create a component
const ReadByUserlist = ({ Name, userImage, time }: any) => {
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", marginHorizontal: 20, marginVertical: 10, alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <AvtaarWithoutTitle ImageSource={{ uri: `${DefaultImageUrl}${userImage}` }} />
        </View>
        <View style={{ marginLeft: 15 }}>
          <Text>{Name}</Text>
          <Text>{moment(time).format("DD MMM YYYY, hh:mm ")}</Text>
        </View>
      </View>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  // eslint-disable-next-line react-native/no-color-literals
  container: {
    backgroundColor: "white",

    width: "100%",
  },
});

//make this component available to the app
export default ReadByUserlist;
