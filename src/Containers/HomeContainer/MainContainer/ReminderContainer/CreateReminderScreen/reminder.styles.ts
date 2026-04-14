import { Colors } from "@/Constants";
import { StyleSheet } from "react-native";

const reminderTypeStyle = StyleSheet.create({
  type_text_APPOINTMENT: {
    color: "#ff8183",
  },
  type_text_REMINDER: {
    color: "#135D66",
  },
  type_text_CALLREMINDER: {
    color: Colors.light.PrimaryColor,
  },
  type_box_APPOINTMENT: {
    backgroundColor: "#ff8183",
  },
  type_box_REMINDER: {
    backgroundColor: "#135D66",
  },
  type_box_CALLREMINDER: {
    backgroundColor: Colors.light.PrimaryColor,
  },
  type_border_APPOINTMENT: {
    backgroundColor: "#ff8183",
  },
  type_border_REMINDER: {
    backgroundColor: "#135D66",
  },
  type_border_CALLREMINDER: {
    backgroundColor: Colors.light.PrimaryColor,
  },
  type_light_APPOINTMENT: {
    backgroundColor: "rgba(255, 129, 131, .05)",
  },
  type_light_REMINDER: {
    backgroundColor: "rgba(1,100,100,.05)",
  },
  type_light_CALLREMINDER: {
    backgroundColor: '#F3F9FC',
  },
});

export const reminderStyle = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "white",
  },
  disable:{
    opacity:.3
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    paddingHorizontal: 20,
    // paddingVertical: 20,
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(51,51,51,.5)",
    marginTop: 8,
    borderRadius: 5,
    paddingRight: 10,
    width: 135,
  },
  inputText: {
    height: 35,
    fontSize: 16,
    paddingHorizontal: 7,
  },
  picker: {
    // backgroundColor: "rgba(51,51,51,.1)",
    alignSelf: "flex-start",
    // height: 30,
    // paddingHorizontal: 15,
    borderRadius: 5,
    // marginVertical: 10,
    marginLeft: 3,
  },
  peopleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  singlePeople: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginHorizontal: 5,
  },
  userNameText: {
    marginHorizontal: 15,
    fontSize: 15,
  },
  pickerSearch: {
    height: 34,
    width: 240,
    fontSize: 14,
    paddingHorizontal: 7,
    // marginBottom:15,
    borderBottomColor: "gray",
    borderBottomWidth: 1,
  },
  peopleList: {
    // backgroundColor: "rgba(51,51,51,.1)",
    paddingTop: 15,
    paddingHorizontal: 10,
  },
  headerContainer: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 10,
    height: 55,
    borderBottomColor: "gray",
    borderBottomWidth: 0.2,
  },
  headerText: {
    fontSize: 17,
    marginLeft: 10,
  },
  FormContainer: {
    // paddingHorizontal: 20,
    // paddingVertical: 20,
  },
  reminderTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "center",
    marginTop: -30,
  },
  reminderType: {
    // marginRight: 10,
    borderColor: "white",
    borderWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: "#EDEDED",
    // minWidth: 125,
    justifyContent: "center",
    alignItems: "center",
  },
  reminderType_Reminder: {
    backgroundColor: "#7ad8ff",
  },
  reminderType_Appointment: {
    backgroundColor: "#ff8183",
  },
  reminderType_CallReminder: {
    backgroundColor: Colors.light.PrimaryColor,
  },
  reminderTypeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  actionButton: {
    width: 160,
    borderRadius: 5,
    backgroundColor: Colors.light.PrimaryColor,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 16,
  },
  errorLabel: {
    fontSize: 12,
    color: "red",
    marginLeft: 5,
  },
  errorBox: {
    backgroundColor: "rgba(255,10,10,.1)",
    borderRadius: 5,
    borderColor: "red",
    borderWidth: 0.5,
    marginRight: 3,
  },
  labelText: {
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 7,
    marginTop: 5,
    color: "gray",
  },
  iconStyle: {
    marginRight: 18,
    marginLeft: 2,
  },
  separator: {
    width: "95%",
    height: 2,
    backgroundColor: "rgba(243,243,243,1)",
    marginVertical: 5,
    alignSelf: "center",
  },
  ...reminderTypeStyle,
});
