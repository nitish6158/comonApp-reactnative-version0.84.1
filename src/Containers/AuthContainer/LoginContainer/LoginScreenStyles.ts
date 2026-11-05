import { $space_md, $space_xl, $space_xs, $space_xxl } from "@/Constants/Spaces";

import { $size_md } from "@/Constants/Sizes";
import { $text_md } from "@/Constants/TextSizes";
import Colors from "@/Constants/Colors";
import { StyleSheet } from "react-native";

export const loginScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  label: {
    marginRight: $space_xs,
  },
  labelBox: {
    alignItems: "center",
    borderBottomWidth: 0,
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: $space_xs,
  },
  labelIcon: {
    color: Colors.light.error,
  },
  logo: {
    height: 135,
    marginTop: $space_xxl * 2,
    width: 135,
  },
  modalBtn: {
    marginBottom: 0,
  },
  modalOverlay: { borderRadius: 15, width: "85%" },
  modalText: {
    fontSize: $text_md,
    lineHeight: 26,
  },
  privacyBox: {
    paddingBottom: $space_md,
    paddingLeft: $space_md,
  },
  privacyCheckbox: {
    backgroundColor: Colors.transparent,
    marginLeft: 0,
    marginRight: $space_xs,
    minWidth: "auto",
  },
  privacyLink: {
    paddingLeft: $space_xs,
    textTransform: "uppercase",
  },
  title: {
    marginBottom: $space_xl,
    textAlign: "center",
  },
  titleOffsetTop: {
    marginTop: "20%",
  },
  buttonStyle: {
    borderColor: Colors.light.formItemBorder,
    borderStyle: "solid",
    borderWidth: 1,
    flex: 1,
    width: "100%",
    height: $size_md,
    borderRadius: 10,
  },
});
