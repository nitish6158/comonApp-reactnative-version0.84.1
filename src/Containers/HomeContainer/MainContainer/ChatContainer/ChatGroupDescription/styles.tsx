import Colors from "@/Constants/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.White,
    flex: 1,
  },
  textinput: {
    borderColor: Colors.light.Hiddengray,
    borderRadius: 5,
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 15,
    paddingTop: 18,
    paddingVertical: 15,
    textAlignVertical: "center",
  },
});
