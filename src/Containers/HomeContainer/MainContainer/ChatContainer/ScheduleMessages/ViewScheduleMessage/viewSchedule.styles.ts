import { Colors } from "@/Constants";
import { StyleSheet } from "react-native";

export const reminderItemStyles = StyleSheet.create({
  messageSeparator: {
    height: 1,
    width: 320,
    alignSelf: "center",
    borderBottomColor: "rgba(200,200,200,.5)",
    borderBottomWidth: 1,
    marginVertical: 25,
  },
  videoPlayButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 35,
    height: 42,
    justifyContent: "center",
    marginTop: 40,
    position: "absolute",
    width: 42,
  },
  imageStyle: {
    height: 110,
    width: 90,
    borderRadius: 10,
    marginBottom: 10,
  },
  reminder: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,.2)",
  },
  admin_profile: {
    height: 30,
    width: 30,
    borderRadius: 50,
  },
  reminder_details: {},
  title_container: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titleText: {
    fontSize: 17,
    fontWeight: "500",
    color: "balck",
  },
  reminder_times: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 12,
  },
  participantIcon: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginRight: 4,
  },
  dateText: {
    marginRight: 10,
    fontSize: 13,
  },
  timeText: {
    fontSize: 13,
  },
  icon: {
    borderRadius: 50,
    backgroundColor: "white",
    marginRight: 10,
    height: 35,
    width: 35,
    justifyContent: "center",
    alignItems: "center",
  },
});

const recurrentStyle = StyleSheet.create({
  recurrentText: {
    fontSize: 13,
    color: "white",
    fontWeight: "500",
  },
  recurrent: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
    marginRight: 10,
  },
});

const singleReminderStyle = StyleSheet.create({
  singleView: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
    maxHeight: 700,
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
    color: "black",
  },
  memberText: {
    fontSize: 16,
    fontWeight: "400",
  },
  absoluteCheck: {
    position: "absolute",
    bottom: 0,
    right: 0,
    zIndex: 5,
    backgroundColor: "white",
    borderRadius: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowGap: {
    marginLeft: 8,
  },
  labelText: {
    fontSize: 14,
    color: "rgba(51,51,51,.8)",
  },
});

const reminderApprovalStyle = StyleSheet.create({
  text_REJECT: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  text_ACCEPT: {},
  text_PENDING: {},
  text_PAUSE: {},
});

const reminderTypeStyle = StyleSheet.create({
  type_text_APPOINTMENT: {
    color: "#ff8183",
  },
  type_text_REMINDER: {
    color: "#135D66",
  },
  type_box_APPOINTMENT: {
    backgroundColor: "#ff8183",
  },
  type_box_REMINDER: {
    backgroundColor: "#135D66",
  },
  type_border_APPOINTMENT: {
    backgroundColor: "#ff8183",
  },
  type_border_REMINDER: {
    backgroundColor: "#135D66",
  },
  type_light_APPOINTMENT: {
    backgroundColor: "rgba(255, 129, 131, .05)",
  },
  type_light_REMINDER: {
    backgroundColor: "rgba(1,100,100,.05)",
  },
});

const headerStyle = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 10,
    marginBottom: 15,
  },
  headingText: {
    color: "black",
    fontSize: 18,
    fontWeight: "500",
    marginHorizontal: 20,
  },
});

export const screenStyle = StyleSheet.create({
  ...headerStyle,
  ...reminderItemStyles,
  ...reminderTypeStyle,
  ...reminderApprovalStyle,
  ...recurrentStyle,
});

export const viewReminderStyle = StyleSheet.create({
  ...headerStyle,
  ...singleReminderStyle,
  ...reminderTypeStyle,
  ...recurrentStyle,
  ...reminderItemStyles,
});
