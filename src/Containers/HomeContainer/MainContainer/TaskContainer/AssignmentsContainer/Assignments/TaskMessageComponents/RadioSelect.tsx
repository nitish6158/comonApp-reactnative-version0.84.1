import { Alert, View } from "react-native";
import { onAddTaskResultType, useTaskReport } from "@Hooks/useTaskReport";
import React, { useState } from "react";

import AttachFile from "./AttachFile";
import { Button } from "react-native-elements";
import { Edge, Task } from "@Service/generated/types";

import TaskPermissionView from "./TaskPermissionView";
import { checkPermission } from "@Util/comon.functions.utils";
import { isEmpty } from "lodash";
import { t } from "i18next";
import CustomRadioButton from "@Components/CustomRadioButton";
import { VectorIconCompat } from "@/Components/icons";

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
  const [selected, setselected] = useState<any>("");
  const [media, setMedia] = useState<any>();

  const onSendChecked = async () => {
    if (edge?.location) {
      await checkPermission();
    }
    onAddTaskResult(edge, task, selected?.label, media ? media : undefined, edge?.location ? true : false);
  };

  const handleOptionChange = (option: any) => {
    setselected(option);
    console.log(option);
  };

  return (
    <View style={{ flex: 1 }}>
      <CustomRadioButton
        options={edge.options ?? []}
        onChange={handleOptionChange}
        containerStyle={{ marginHorizontal: 40, marginBottom: 8 }}
      />
      {edge?.location && (
        <TaskPermissionView
          message={t("task.useLocation")}
          icon={<VectorIconCompat name="map-marker" size={24} color="gray" />}
        />
      )}

      {edge?.media && (
        <AttachFile
          task={{ mediaType: edge?.media } as any}
          addTaskLoading={addTaskLoading}
          edge={edge}
          onAddTaskResult={(_edge, _task, _opts, file) => {
            setMedia(file);
          }}
          mediaRequiredOnOptions={edge?.media as any}
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
