import { StyleSheet, View } from "react-native";

import Colors from "@/Constants/Colors";
import React from "react";
import Text from "./Text";
//import liraries
import moment from "moment";

// create a component
const DividingDateChat = ({ Time }: any) => {
  const currentDate = moment().format("DD.MM.YYYY");

  return (
    <View style={styles.container}>
      <View style={styles.DateCon}></View>
      <View style={styles.DateMain}>
        <Text size="xs" style={styles.TextColor}>
          {currentDate == Time ? "Today" : Time}
        </Text>
      </View>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  // eslint-disable-next-line react-native/no-color-literals
  DateCon: { borderColor: "#E0E0E0", borderWidth: 0.3, position: "absolute", width: "100%" },
  DateMain: {
    alignSelf: "center",
    backgroundColor: Colors.light.White,
    borderRadius: 5,
    marginTop: -10,
    paddingVertical: 3,
    width: 80,
  },
  TextColor: { color: Colors.light.Hiddengray, textAlign: "center" },
  container: {
    marginHorizontal: 15,
    marginVertical: 23,
  },
});

//make this component available to the app
export default DividingDateChat;
