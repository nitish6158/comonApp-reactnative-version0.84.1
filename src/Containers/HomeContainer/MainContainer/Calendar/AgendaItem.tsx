import React, { useCallback } from "react";
import { StyleSheet, Alert, View, Text, TouchableOpacity } from "react-native";
import moment from "moment";
import { isEmpty } from "lodash";
import { Colors } from "@/Constants";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { IAllCalendarData } from "@/Atoms/CalendarAtom";
import { useTranslation } from "react-i18next";

interface ItemProps {
  item: IAllCalendarData;
}

export default function AgendaItem(props: ItemProps) {
  const { item } = props;
  const {t} = useTranslation()

  const buttonPressed = useCallback(() => {
    Alert.alert("Show me more");
  }, []);

  const itemPressed = useCallback(() => {
    Alert.alert(item.title);
  }, []);

  if (isEmpty(item)) {
    return (
      <View style={styles.emptyItem}>
        <Text style={styles.emptyItemText}>{t("reminders.no-events-planned-today")}</Text>
      </View>
    );
  }
  const start = new Date(item?.startDate);
  const end = new Date(item?.endDate);
  return (
    <TouchableOpacity
      onPress={itemPressed}
      style={[styles.rowDirection, styles.item, { justifyContent: "space-between" }]}
    >
      <View>
        <View style={[styles.rowDirection]}>
          {item?.type == "REMINDER" ? (
            <MaterialIcons name="notifications-on" size={25} color={"#128276"} />
          ) : (
            <Ionicons name="list-circle-sharp" size={25} />
          )}
          <Text style={styles.itemTitleText}>{item.label}</Text>
        </View>
        <Text style={styles.itemDescText}>{item.description}</Text>
      </View>
      <View style={{ alignItems: "center" }}>
        <Text style={styles.itemHourText}>
          {item?.recurrent == "ANYTIME" ? t("reminders.anytime") : moment(start).format("HH:mm")}
        </Text>
        {item?.recurrent != "ANYTIME" && (
          <Text style={styles.itemDurationText}>{end && start ? `${moment(end).diff(start, "day")}d` : ""}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    padding: 10,
    borderBottomColor: Colors.light.gray,
    borderBottomWidth: 1,
  },
  rowDirection: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemDescText: {
    color: "grey",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  itemHourText: {
    color: "black",
  },
  itemDurationText: {
    color: "grey",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  itemTitleText: {
    color: "black",
    marginLeft: 5,
    fontWeight: "bold",
    fontSize: 16,
  },
  itemButtonContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  emptyItem: {
    paddingLeft: 20,
    height: 52,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "lightgrey",
  },
  emptyItemText: {
    color: "lightgrey",
    fontSize: 14,
  },
});
