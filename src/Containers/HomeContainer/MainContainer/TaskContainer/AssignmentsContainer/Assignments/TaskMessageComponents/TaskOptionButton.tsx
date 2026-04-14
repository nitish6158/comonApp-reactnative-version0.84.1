import React, { useMemo } from "react";
import { Dimensions, Pressable, Text, StyleSheet } from "react-native";
import Color from "@/Constants/Colors";

type subtype = "like_dislike" | "yes_no" | "custom_type";

const { width } = Dimensions.get("screen");

type props = {
  subtype: string | null;
  edgeLabel: string;
  onPressTaskButton: () => void;
  title?: string;
};

export const TaskOptionButton = ({ subtype, edgeLabel, title, onPressTaskButton }: props) => {
  const TitleRender = useMemo(() => {
    if (subtype == "like_dislike") {
      return edgeLabel == "Like" ? "👍" : "👎";
    } else {
      return title ?? edgeLabel;
    }
  }, [subtype, edgeLabel, title]);

  return (
    <Pressable style={styles.main} onPress={onPressTaskButton}>
      <Text style={{ color: "white", fontSize: 16 }}>{TitleRender}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  main: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: Color.light.PrimaryColor,
    borderRadius: 20,
    justifyContent: "center",
    marginVertical: 3,
    minHeight: 45,
    paddingHorizontal: 5,
    paddingVertical: 5,
    width: 300,
  },
});
