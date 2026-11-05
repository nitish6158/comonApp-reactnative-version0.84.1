import { fonts } from "@/Constants";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: 20,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  logoStyle: {
    height: 70,
    width: 70,
  },
  detailContainer: {
    marginBottom: 20,
  },
  titleText: {
    fontFamily: fonts.Lato,
    fontSize: 22,
    textAlign: "center",
    width: 300,
    alignSelf: "center",
  },
  versionText: {
    textAlign: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    marginVertical: 20,
  },
  actionButton: {
    width: 160,
    borderRadius: 30,
    borderColor: "black",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    paddingVertical: 10,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
