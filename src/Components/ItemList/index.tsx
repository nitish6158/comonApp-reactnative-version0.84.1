import { Pressable, StyleSheet, Text, View } from "react-native";

import Arrow from "@Images/Profile/arrow.svg";
import Colors from "@/Constants/Colors";
/* eslint-disable react-native/no-inline-styles */
//import liraries
import React from "react";

interface Props {
  Icon?: {};
  Title: string;
  Count?: string | number;
  SecondryText?: string | number;
  CountStyle?: {};
  _onPress: () => {};
}
const ItemList = ({ Icon, Title, Count, SecondryText, _onPress, CountStyle }: Props) => {
  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <Pressable onPress={_onPress} style={[styles.ItemListCon, { marginTop: SecondryText ? -20 : 10 }]}>
      <View style={styles.IconStyle}>
        {Icon}
        <View style={{ marginLeft: 13 }}>
          <Text style={{ marginTop: SecondryText ? 30 : 0, fontFamily: "Lato", fontSize: 16 }}>{Title}</Text>
          {SecondryText && <Text style={[styles.SecondryText, { fontSize: 14 }]}>{SecondryText}</Text>}
        </View>
      </View>
      <View style={styles.LeftSide}>
        <View style={styles.RightArrow}>
          <Text style={[styles.Count, CountStyle]}>{Count}</Text>
          <Arrow style={styles.Arrow} />
        </View>
      </View>
    </Pressable>
  );
};

// define your styles
const styles = StyleSheet.create({
  // eslint-disable-next-line react-native/no-unused-styles, react-native/no-color-literals
  container: {
    alignItems: "center",
    backgroundColor: "#2c3e50",
    flex: 1,
    justifyContent: "center",
  },
  // eslint-disable-next-line react-native/sort-styles
  LeftSide: {
    alignItems: "center",

    flex: 0.5,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  ItemListCon: { alignItems: "center", flexDirection: "row", marginHorizontal: 20, marginVertical: 10 },
  IconStyle: { alignItems: "center", flex: 1, flexDirection: "row" },
  RightArrow: { alignItems: "center", flexDirection: "row" },
  Count: { color: Colors.light.Hiddengray, fontFamily: "Lato", marginLeft: 13 },
  Arrow: { marginLeft: 15 },
  SecondryText: { color: Colors.light.Hiddengray, fontFamily: "Lato", lineHeight: 16, marginTop: 5 },
  // eslint-disable-next-line react-native/no-unused-styles
  scrollView: { paddingBottom: 100 },
});

//make this component available to the app
export default ItemList;
