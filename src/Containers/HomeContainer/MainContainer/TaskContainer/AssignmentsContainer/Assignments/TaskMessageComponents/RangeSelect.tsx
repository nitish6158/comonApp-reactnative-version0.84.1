import * as React from "react";

import { Button, Slider } from "react-native-elements";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";

import AttachFile from "./AttachFile";
import Colors from "@/Constants/Colors";
import { Edge } from "@Service/generated/types";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { Task } from "@Service/generated/assigment.generated";
import TaskPermissionView from "./TaskPermissionView";
import { checkPermission } from "@Util/comon.functions.utils";
import fonts from "@/Constants/fonts";
import { onAddTaskResultType } from "@Hooks/useTaskReport";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { windowWidth } from "@Util/ResponsiveView";
import DigitalSignature from "@Components/DigitalSignature";

export function RangeSelect({
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
  const [range, setRange] = useState<Number | undefined>(0);
  const [selected, setselected] = useState("");
  const [media, setMedia] = useState();
  const [finalResult, setFinalResult] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [signature, setSignature] = useState("");

  const { t } = useTranslation();

  const onSendChecked = async () => {
    let requiredSignature = false;
    if (task?.rangeExpression?.customExp?.length) {
      const customExp = task.rangeExpression.customExp;
      for (let item of customExp) {
        if (item?.signature) {
          const exp = typeof item?.value == "string" ? JSON.parse(item.value) : item.value;
          if (exp?.length) {
            let expression = "";
            exp.forEach((e, i) => {
              const operator = e?.operator;
              const value = e?.value;
              const gate = e?.gate;
              expression += range + operator + value + (i == exp.length - 1 ? "" : gate);
            });
            const isTrue = eval(expression);
            if (isTrue) {
              requiredSignature = true;
              break;
            }
          }
        }
      }
    }

    if (requiredSignature && !signature) {
      setModalVisible(!modalVisible);
      return;
    }
    if (selected?.location) {
      await checkPermission();
    }
    onAddTaskResult(edge, task, range, media, selected?.location, signature);
  };

  const onchangeValue = (e: any) => {
    setRange(e);
  };
  const onCompelete = (e: any) => {
    setFinalResult(e);
  };

  React.useEffect(() => {
    if (edge?.location || edge.media) {
      setselected(edge);
    }
  }, []);

  React.useEffect(() => {
    if (task.rangeExpression.min) {
      setRange(task.rangeExpression.min);
    }
  }, [task.rangeExpression?.min]);

  function evaluateConditions(operations, currentValue) {
    for (const operation of operations) {
      const conditions = JSON.parse(operation.value);

      // Evaluate conditions for the current operation
      const operationResult = conditions.every((condition) => {
        switch (condition.operator) {
          case ">":
            return currentValue > condition.value;
          case "<":
            return currentValue < condition.value;
          // Add more cases as needed for other operators
          default:
            return false;
        }
      });

      // If all conditions for the current operation are met, return the message
      if (operationResult) {
        return operation.message;
      }
    }

    // If no operation is satisfied, return a default message or handle accordingly
    return "";
  }

  const PromptMessage = useMemo(() => {
    return evaluateConditions(task.rangeExpression?.customExp, finalResult);
  }, [task.rangeExpression?.customExp, finalResult]);

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          backgroundColor: "rgba(255, 255, 255, 1)",
          borderRadius: 5,
          justifyContent: "center",
          marginTop: 15,
          padding: 20,
          width: windowWidth / 1.2,
          alignSelf: "center",
          flexDirection: "column",
        }}
      >
        <View
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 10 }}
        >
          <View>
            <Text style={styles.textStyle}>
              <B>{task.rangeExpression?.min}</B>
            </Text>
          </View>
          <View>
            <Text style={styles.textStyle}>
              <B>{task.rangeExpression?.max}</B>
            </Text>
          </View>
        </View>
        <View style={{ alignSelf: "center" }}>
          <Slider
            step={1}
            minimumTrackTintColor={Colors.light.PrimaryColor}
            style={{ width: windowWidth / 1.5, height: 40 }}
            onSlidingComplete={(e) => {
              onCompelete(e);
            }}
            onValueChange={(e) => {
              onchangeValue(e);
            }}
            value={Number(range)}
            disabled={task.rangeExpression?.min == task.rangeExpression?.max}
            minimumValue={Number(task.rangeExpression.min)}
            maximumValue={Number(task.rangeExpression?.max)}
            thumbTintColor={Colors.light.PrimaryColor}
            thumbStyle={{ height: 25, width: 25 }}
          />
          <Text style={{ fontSize: 17, textAlign: "center" }}>{range}</Text>
        </View>
        <Text
          style={{
            padding: 10,
            textAlign: "center",
            fontSize: 14,
            fontFamily: fonts.Lato,
            lineHeight: 14,
            paddingTop: 20,
          }}
        >
          {PromptMessage}
        </Text>
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

      <DigitalSignature
        onPressSave={(image) => {
          setSignature(image);
          setModalVisible(!modalVisible);
        }}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />

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
        
        buttonStyle={{ height: 45, borderRadius: 30, width: 280, alignSelf: "center", marginTop: 5 }}
        loading={addTaskLoading}
        title={edge.label || t("btn.submit")}
        onPress={onSendChecked}
        containerStyle={{ flex: 1, paddingBottom: 5 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  textStyle: {
    color: Colors.light.black,
    fontFamily: fonts.Lato,
    fontSize: 12,
    lineHeight: 18,
  },
});

function B({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontWeight: "bold" }}>{children}</Text>;
}
