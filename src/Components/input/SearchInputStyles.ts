import Colors from "@/Constants/Colors";
import { StyleSheet } from "react-native";

const Styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: Colors.light.background,
    borderBottomWidth: 0,
    borderTopWidth: 0,
  },
  close: { position: "absolute", zIndex: 9999, opacity: 0.5, top: 15, right: 14 },
  searchicon: { position: "absolute", left: 10, zIndex: 9999, opacity: 0.5, top: 15 },
  inputContainerStyle: {
    // backgroundColor: Colors.light.background,
    elevation: 5,
    fontSize: 19,
    height: 60,
    paddingHorizontal: 19,
    paddingLeft: 44,
    paddingVertical: 13,
    shadowColor: Colors.dark.background,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  inputStyle: {
    backgroundColor: Colors.light.background,
  },
  style: {
    backgroundColor: Colors.light.background,
  },
});

export default Styles;
