import Colors from "@/Constants/Colors";
import { StyleSheet } from "react-native";

export const IMAGE_HEIGHT = 200;
export const IMAGE_HEIGHT_SMALL = 70;

const styles = StyleSheet.create({
  active: {
    borderColor: Colors.light.link,
    borderWidth: 2,
    shadowColor: Colors.light.link,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  avatar: {
    alignContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.backgroundMessageQuestion,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  contact: {
    alignItems: "center",
    flexDirection: "row",
    marginLeft: 45,
    paddingVertical: 12,
  },
  container: {
    backgroundColor: Colors.light.background,
    height: "100%",
  },
  content: {
    marginLeft: 10,
    width: "60%",
  },
  modal: { justifyContent: "flex-end", margin: 0 },
  number: {
    paddingVertical: 8,
    width: "100%",
  },
  numbers: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: "auto",
    minHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 32,
  },
  text: {
    color: Colors.light.link,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 24,
  },
});

export default styles;
