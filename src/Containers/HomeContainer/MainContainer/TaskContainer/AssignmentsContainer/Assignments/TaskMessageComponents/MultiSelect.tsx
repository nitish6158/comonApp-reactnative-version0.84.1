import * as React from "react";

import { Button, CheckBox } from "react-native-elements";
import { onAddTaskResultType, useTaskReport } from "@Hooks/useTaskReport";
import { Edge, EdgeOption, Task } from "@Service/generated/types";
import { Text, View, StyleSheet, Pressable, Image, Dimensions } from "react-native";

import AttachFile from "./AttachFile";
import Colors from "@/Constants/Colors";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import TaskPermissionView from "./TaskPermissionView";
import { checkPermission } from "@Util/comon.functions.utils";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { $space_xs, $space_xxl } from "@/Constants";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import DigitalSignature from "@Components/DigitalSignature";

export function MultiSelect({
  taskDelay,
  task,
  onAddTaskResult,
  addTaskLoading,
  edge,
}: {
  taskDelay: Number;
  task: Task;
  addTaskLoading: boolean;
  onAddTaskResult: onAddTaskResultType;
  edge: Edge;
}) {
  const isTimeout = task?.edges.find((e) => e.type === "TIMEOUT");
  const singleEdge = task?.edges.find((e) => e.type === "DEFAULT" && e?.options?.length > 0);

  const [selected, setSelected] = useState<EdgeOption | null>(null);
  const [media, setMedia] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [signature, setSignature] = useState("");

  // const {addTaskLoading} = useTaskReport()
  const { t } = useTranslation();
  const [checked, setChecked] = useState<Array<EdgeOption>>([]);
  function onSetChecked(option: EdgeOption) {
    const checkAnswered = [];
    const checkIfAlreadyExist = checked.find((e) => e.label === option.label);
    if (checkIfAlreadyExist) {
      const filteredAnswer = checked.filter((e) => e.label !== option.label);
      checkLocationOrMediaType(option, true);
      setChecked(filteredAnswer);
    } else {
      checkLocationOrMediaType(option, false);
      setChecked([...checked, option]);
    }
  }

  function checkLocationOrMediaType(option: EdgeOption, isFiltered: boolean) {
    if (!isFiltered) {
      if (option.media || option.location || option.signature) {
        setSelected({ ...option });
      }
    } else {
      setSelected(null);
    }
  }

  async function onSendChecked() {
    if (selected?.signature && !signature) {
      setModalVisible(true);
      return;
    }
    if (selected?.location) {
      const value = await checkPermission();
    }
    const getTaskAnswer = checked.map((e) => e.label);
    onAddTaskResult(
      singleEdge,
      task,
      getTaskAnswer.toString(),
      media ?? undefined,
      selected?.location,
      selected?.signature ? signature : null
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 15, justifyContent: "center" }}>
        {singleEdge?.options?.map((option, index) => (
          <Pressable
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingLeft: 10,
              paddingRight: 20,
              paddingVertical: 5,
              borderRadius: 30,
              backgroundColor: Colors.light.PrimaryColor,
              marginHorizontal: 5,
              marginVertical: 3,
            }}
            key={index}
            onPress={() => onSetChecked(option)}
          >
            <MaterialCommunityIcons
              name={checked.find((e) => e.label == option.label) ? "check-circle" : "checkbox-blank-circle-outline"}
              size={28}
              color="white"
            />
            <Text style={{ marginLeft: 5, color: "white", fontSize: 16 }}>{option.label}</Text>
          </Pressable>
        ))}
      </View>

      {selected?.location && (
        <TaskPermissionView
          message={t("task.useLocation")}
          icon={<FontAwesome name="map-marker" size={24} color="gray" />}
        />
      )}

      {selected?.media && (
        <AttachFile
          task={{ mediaType: selected?.media }}
          addTaskLoading={addTaskLoading}
          edge={edge}
          onAddTaskResult={(edge, task, undefined, file) => {
            setMedia(file);
          }}
          mediaRequiredOnOptions={selected.media}
        />
      )}
      {selected?.signature && (
        <DigitalSignature
          onPressSave={(image) => {
            setSignature(image);
            setModalVisible(!modalVisible);
          }}
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
        />
      )}
      {signature ? (
        <View style={{ alignItems: "center" }}>
          <Image
            resizeMode={"contain"}
            style={{
              width: Dimensions.get("screen").width - 100,
              height: 110,
              backgroundColor: "#eee",
              marginTop: 10,
              borderRadius: 20,
              marginBottom: 20,
            }}
            source={{ uri: "data:image/png;base64," + signature }}
          />
        </View>
      ) : null}
      {(taskDelay == 0 || taskDelay == undefined) && (
        <Button
          disabled={
            checked.every((item) => typeof item == "string" || item == true) ||
            (selected?.media && !media ? true : false)
          }
          buttonStyle={{ height: 45, borderRadius: 30, width: 280, alignSelf: "center" }}
          loading={addTaskLoading}
          title={t("btn.submit")}
          onPress={onSendChecked}
          containerStyle={{ flex: 1, paddingBottom: 5 }}
        />
      )}
    </View>
  );
}

export const styles = StyleSheet.create({
  checkbox: {
    alignItems: "center",
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 5,
    justifyContent: "center",

    marginBottom: $space_xs,
    minHeight: $space_xxl + 13,

    minWidth: "35%",
    padding: 20,
  },
});
