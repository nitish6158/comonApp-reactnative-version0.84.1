import { Alert, View } from "react-native";
import { onAddTaskResultType, useTaskReport } from "@Hooks/useTaskReport";
import React, { useState } from "react";

import AttachFile from "./AttachFile";
import { Button } from "react-native-elements";
import { Edge, Task } from "@Service/generated/types";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import TaskPermissionView from "./TaskPermissionView";
import { checkPermission } from "@Util/comon.functions.utils";
import { isEmpty } from "lodash";
import { t } from "i18next";
import CustomRadioButton from "@Components/CustomRadioButton";
interface Option {
  label: string;
  value: string;
}

export const RadioSelect = ({
  task,
  edge,
  onAddTaskResult,
  addTaskLoading,
}: {
  task: Task;
  edge: Edge;
  addTaskLoading: boolean;
  onAddTaskResult: onAddTaskResultType;
}) => {
  const [selected, setselected] = useState("");
  const [media, setMedia] = useState();

  const onSendChecked = async () => {
    if (edge?.location) {
      await checkPermission();
    }
    onAddTaskResult(edge, task, selected?.label, media ? media : undefined, edge?.location ? true : false)();
  };

  const handleOptionChange = (option: Option) => {
    setselected(option);
    console.log(option);
  };

  return (
    <View style={{ flex: 1 }}>
      <CustomRadioButton
        options={edge.options}
        onChange={handleOptionChange}
        containerStyle={{ marginHorizontal: 40, marginBottom: 8 }}
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
      <Button
        disabled={isEmpty(selected)}
        loading={addTaskLoading}
        buttonStyle={{ height: 45, borderRadius: 30, width: 280, alignSelf: "center" }}
        title={t("btn.submit")}
        onPress={onSendChecked}
        containerStyle={{ flex: 1, paddingBottom: 5 }}
      />
    </View>
  );
};
