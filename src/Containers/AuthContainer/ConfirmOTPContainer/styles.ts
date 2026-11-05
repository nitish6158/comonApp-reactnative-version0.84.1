import Colors from "@/Constants/Colors";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  title: {
    fontSize: 25,
    fontWeight: "700",
    paddingBottom: 40,
    paddingTop: 50,
    textAlign: "center",
  },
  icon: {
    height: 158 / 2.4,
    marginLeft: "auto",
    marginRight: "auto",
    width: 217 / 2.4,
  },
  subTitle: {
    paddingTop: 30,
    textAlign: "center",
  },
  nextButton: {
    marginTop: 30,
    height: 48,
    borderRadius: 60,
  },
  resendButton: {
    backgroundColor: Colors.dark.background,
    borderRadius: 60,
    height: 48,
  },
  changeButton: {
    backgroundColor: Colors.light.link,
    borderRadius: 60,
    height: 48,
    marginVertical: 15,
  },
  cancel: {
    borderRadius: 60,
    height: 48,
  },
  save: {
    backgroundColor: Colors.light.error,
    borderRadius: 60,
    height: 48,
  },
  changePhoneTitle: {
    marginBottom: 32,
    textAlign: "center",
  },
});

export default styles;
