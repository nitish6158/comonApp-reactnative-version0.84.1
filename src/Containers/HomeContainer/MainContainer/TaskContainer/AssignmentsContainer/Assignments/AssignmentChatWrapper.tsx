import React, { useEffect, useMemo, useState } from "react";
import { useRef } from "react";
import { ScrollView, View, Text, Dimensions, KeyboardAvoidingView, Platform, Keyboard } from "react-native";
import { SingleTaskMessage } from "./SingleTaskMessage";
import { CurrentTaskView } from "./CurrentTaskView";
import { useAtom, useAtomValue } from "jotai";
import { activeAssignmentAtom, activeReportAtom } from "@/Atoms/AssignmentAtom";
import { useTranslation } from "react-i18next";

const { height } = Dimensions.get("screen");

type AssignmentChatWrapperProps = {};

export function AssignmentChatWrapper({}: Readonly<AssignmentChatWrapperProps>) {
  const ScrollViewRef = useRef<ScrollView>(null);
  const [footerHeight, setFooterHeight] = useState<number>(0);
  const [keyboardAvoidationHeight, setKeyboardAvoidationHeight] = useState(0);
  const currentAssignment = useAtomValue(activeAssignmentAtom);
  const [currentReport] = useAtom(activeReportAtom);
  const { t } = useTranslation();

  useEffect(() => {
    const openEventSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardAvoidationHeight(50);
    });
    const closeEventSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardAvoidationHeight(0);
    });
    return () => {
      openEventSubscription.remove();
      closeEventSubscription.remove();
    };
  }, []);

  const onContentSizeChange = () => {
    setTimeout(() => {
      ScrollViewRef?.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  const onFooterLayout = (event: any) => {
    const height = event.nativeEvent.layout.height;
    if (currentReport?.tasksData.length == 0) {
      setFooterHeight(height);
    }
  };

  const TaskMessages = useMemo(() => {
    return currentReport?.tasksData.map((item, index) => {
      return <SingleTaskMessage key={`${item.taskId}${index}`} item={item} />;
    });
  }, [currentReport?.tasksData]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        automaticallyAdjustKeyboardInsets={true}
        keyboardShouldPersistTaps={"always"}
        ref={ScrollViewRef}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={onContentSizeChange}
        contentContainerStyle={{ paddingBottom: keyboardAvoidationHeight }}
      >
        {currentReport?.tasksData.length > 0 ? TaskMessages : NoTaskMessagesView(footerHeight, t)}
        <View onLayout={onFooterLayout}>
          <CurrentTaskView currentReport={currentReport} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function NoTaskMessagesView(footerHeight: number, t: any) {
  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 10,
        height: height - footerHeight,
      }}
    >
      <Text>{t("assignmentStarted")}</Text>
    </View>
  );
}
