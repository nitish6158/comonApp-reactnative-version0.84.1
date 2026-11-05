import { onAddTaskResultType, useTaskReport } from "@Hooks/useTaskReport";
import { Edge, Task, TaskTypes } from "@Service/generated/types";
import React, { useEffect, useState } from "react";

import AttachFile from "./AttachFile";
import { Button, Input } from "react-native-elements";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import TaskPermissionView from "./TaskPermissionView";
import ToastMessage from "@Util/ToastMesage";
import { TextInput, View, Keyboard, Image, Dimensions } from "react-native";


import { useTranslation } from "react-i18next";
import { InputWithFocus } from "@Components/input/Input";
import DigitalSignature from "@/Components/DigitalSignature";

export function TaskInput({
  task,
  edge,
  onAddTaskResult,
  addTaskLoading,
}: {
  task: Task;
  edge: Edge;
  addTaskLoading: boolean;
  onAddTaskResult: onAddTaskResultType;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const [selected, setselected] = useState({});
  const [media, setMedia] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [signature, setSignature] = useState("");

  const handleChange = (text: string) => {
    // const val = task.type === TaskTypes.NumberInput ? text.replace(/[^0-9]/g, "") : text;
    setValue(text);
  };

  async function onSubmit() {
    if (edge.signature && !signature) {
      setModalVisible(!modalVisible);
      return;
    }
    if (edge?.media) {
      if (!media) {
        ToastMessage(t("label.select-media"));
        return;
      }
      onAddTaskResult(edge, task, value, media, edge?.location, signature);
      setValue("");
      setselected({});
    } else {
      onAddTaskResult(edge, task, value, media, edge?.location, signature);
      setValue("");
      setselected({});
    }
  }

  return (
    <View style={{ marginTop: 10, marginHorizontal: 20, flex: 1 }}>
      <InputWithFocus
        keyboardType={task.type === TaskTypes.NumberInput ? "numeric" : "default"}
        defaultValue={value}
        placeholder={t("task.input")}
        onChangeText={handleChange}
        autoFocus={true}
      />

      {edge?.location && (
        <TaskPermissionView
          message={t("task.useLocation")}
          icon={<FontAwesome name="map-marker" size={24} color="gray" />}
        />
      )}

      {edge?.media && (
        <AttachFile
          task={{ mediaType: edge?.media }}
          addTaskLoading={addTaskLoading}
          edge={edge}
          onAddTaskResult={(edge, task, undefined, file) => {
            setMedia(file);
          }}
          mediaRequiredOnOptions={edge?.media}
        />
      )}
      {edge?.signature && (
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
      <Button
        disabled={value.length > 0 ? false : true}
        buttonStyle={{ height: 45, borderRadius: 30, width: 280, alignSelf: "center" }}
        loading={addTaskLoading}
        title={t("btn.submit")}
        onPress={onSubmit}
        containerStyle={[]}
      />
    </View>
  );
}
