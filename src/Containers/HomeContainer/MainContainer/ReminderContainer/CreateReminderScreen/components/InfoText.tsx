import { View, Text, ViewStyle } from "react-native";
import React, { useMemo } from "react";
import Entypo from "react-native-vector-icons/Entypo";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

type props = {
  text: string;
  style?: ViewStyle;
  recursiveList?: Array<{
    occurrencesDate: string;
  }>;
};
export default function InfoText({ text, style, recursiveList }: props) {
  const { t } = useTranslation();
  const formattedText = useMemo(() => {
    if (text.length > 0) {
      return text;
    } else {
      if (recursiveList) {
        if (recursiveList.length == 0) {
          return `0 ${t("reminders.reminders")}`;
        } else {
          let first = dayjs(recursiveList[0].occurrencesDate).calendar(null, {
            sameDay: `[${t("reminders.today")} at] HH:mm `,
            nextDay: `[${t("reminders.tomorrow")} at] HH:mm `,
            nextWeek: "DD MMMM YYYY | HH:mm",
            sameElse: "DD MMMM YYYY | HH:mm",
          });

          return `${t("reminders.occurs")} ${first} ${
            recursiveList.length > 1
              ? `${t("reminders.and-then")} ${
                  recursiveList.length > 2
                    ? `${recursiveList.length - 1} ${t("reminders.reminders")}${
                        recursiveList.length - 2 > 1 ? "s" : ""
                      } ${t("reminders.till")} `
                    : ""
                }${dayjs(recursiveList[recursiveList.length - 1].occurrencesDate).format("DD MMMM YYYY")}`
              : ""
          }`;
        }
      } else {
        return `0 ${t("reminders.reminders")}`;
      }
    }
  }, [recursiveList, text]);

  return (
    <View
      style={[
        {
          backgroundColor: "#FFF9D0",
          alignSelf: "flex-start",
          paddingHorizontal: 8,
          paddingVertical: 8,
          borderRadius: 10,
          flexDirection: "row",
        },
        style && style,
      ]}
    >
      <Entypo name="info" size={12} color={"#DD761C"} style={{ marginRight: 5, marginTop: 2 }} />
      <Text
        style={{
          fontSize: 12,
        }}
      >
        {formattedText}
      </Text>
    </View>
  );
}
