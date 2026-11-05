import Colors from "@/Constants/Colors";
import { StyleSheet } from "react-native";

const Styles = StyleSheet.create({
  AvataarContainer: { borderRadius: 50, height: 50, overflow: "hidden", width: 50 },
  Container: {
    backgroundColor: Colors.light.background,
    // borderBottomWidth: 0.4,
    // borderColor: Colors.light.Hiddengray,
    flexDirection: "row",
    // height: 82,
    marginHorizontal: 5,
    paddingVertical: 10,
  },
  MainContainer: {
    backgroundColor: "white",
    flex: 1,
  },
});

export default Styles;
