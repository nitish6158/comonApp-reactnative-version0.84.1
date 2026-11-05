import { windowHeight, windowWidth } from "@Util/ResponsiveView";

import Colors from "@/Constants/Colors";
/* eslint-disable react-native/no-color-literals */
import { StyleSheet } from "react-native";

const style = StyleSheet.create({
  IconContainer: {
    alignItems: "center",
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 100,
    height: 100,
    justifyContent: "center",
    marginTop: 10,
    width: 100,
  },
  accept: {
    backgroundColor: Colors.light.PrimaryColor,
  },
  acceptText: {
    color: Colors.light.White,
  },
  button: {
    alignItems: "center",
    backgroundColor: "blue",
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: "center",
    marginHorizontal: 20,
    paddingVertical: 10,
  },
  container: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 15,
    justifyContent: "center",
    marginTop: "20%",
    maxHeight: windowHeight / 1.4,
    paddingBottom: 20,
    paddingTop: 14,
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.43,
    shadowRadius: 9.51,
    width: windowWidth / 1.1,
    zIndex: 1,
  },
  noInvite: {
    alignItems: "center",
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 10,
    justifyContent: "center",
    marginBottom: 5,
    marginTop: 15,
    padding: 15,
    width: "93%",
  },

  reject: {
    backgroundColor: Colors.light.White,
    borderColor: Colors.light.red,
    borderWidth: 1,
  },
  rejectText: {
    color: Colors.light.red,
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10, marginTop: 15 },
  viewContainer: {
    alignItems: "center",
    borderRadius: 5,
    height: 110,
    marginVertical: 20,
    paddingVertical: 10,
    width: "90%",
    marginBottom: 50,
  },
});
export default style;
