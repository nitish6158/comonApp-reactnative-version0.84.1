import { $space_md, $space_xl, $space_xs } from "@/Constants/Spaces";

import { $text_xs } from "@/Constants/TextSizes";
import Colors from "@/Constants/Colors";
import { StyleSheet } from "react-native";
import { padding } from "@Util/styleUtils";

const inputStyle = {
  width: "100%",
  color: Colors.light.formItemBorder,
  borderWidth: 1,
  borderRadius: 10,
  paddingHorizontal: $space_md,
  height: 50,
};

export const InputStyle = StyleSheet.create({
  containerStyleInputEl: {
    marginBottom: $space_xl,
    ...padding(0),
  },
  error: {
    ...inputStyle,
    borderColor: Colors.light.error,
  },
  input: {
    borderWidth: 0,
    elevation: 0,
    borderRadius: 10,
    fontSize: $text_xs,
    shadowColor: Colors.transparent,
    shadowOpacity: 0,
  },
  inputContainerStyle: {
    ...inputStyle,
    borderColor: Colors.light.formItemBorder,
    borderRadius: 10,
    height: 50,
  },
  inputFocusedStyle: {
    ...inputStyle,
    borderColor: Colors.light.formItemBorderFocused,
  },
  label: {
    marginRight: $space_xs,
  },
  labelContainer: {
    alignItems: "center",
    borderBottomWidth: 0,
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: $space_xs,
  },
  labelIcon: {
    color: Colors.light.error,
  },
  rightIconContainerStyle: {
    paddingRight: 0,
  },
});
