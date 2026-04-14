import { Dimensions, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { typographyStyles } from "../../styles/main";
import React from "react";
import { Report } from "@Service/generated/report.generated";
import moment from "moment";
import { navigate } from "@Navigation/utility";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

const { width } = Dimensions.get("screen");

export const ReportListItem: React.FC<{ item: Report }> = ({ item }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { fontScale } = useWindowDimensions();
  const typography = typographyStyles(fontScale);

  const onGoTask = (report: Report) => () => {
    navigate("ReportScreen", {
      reportId: report._id,
      title: report.assignment.scenario.name,
      subtitle: report.assignment.scenario.description,
    });
  };

  if (!item.assignment.scenario) {
    return <></>;
  }

  return (
    <Pressable onPress={onGoTask(item)} style={styles.main}>
      <View style={{ width: width - 40 }}>
        <View style={{ maxWidth: "85%" }}>
          <Text style={styles.taskTitle}>{item?.assignment?.scenario?.name}</Text>
          {item?.assignment?.scenario?.description?.length > 0 && (
            <Text style={styles.taskDescription}>
              {item?.assignment?.scenario?.description?.slice(0, 40)}
              {item?.assignment?.scenario?.description?.length > 40 ? "..." : ""}
            </Text>
          )}
        </View>
        {item.startTime && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginTop: 5,
            }}
          >
            <Text style={styles.subtitle}>
              {t("task.start-time")} {dayjs(item.startTime).format("MMM DD HH:mm")}
            </Text>
            <Text style={styles.subtitle}>
              {item.completeTime
                ? `${t("task.end-time")} ${moment(item.completeTime).format("MMM DD HH:mm")}`
                : t("report.in-progress")}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  main: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  subtitle: {
    color: "rgba(51,51,51,.8)",
    fontSize: 12,
    // textAlign: "center",
  },
  taskDescription: {
    color: "rgba(51,51,51,.5)",
    fontSize: 14,
  },
  taskTitle: {
    color: "rgba(51,51,51,1)",
    fontSize: 16,
    fontWeight: "500",
  },
});
