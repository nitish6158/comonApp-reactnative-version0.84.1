import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import React, { useRef, useState } from "react";
import Modal from "react-native-modal";
import { DocumentPickerResponse } from "react-native-document-picker";
import AntDesign from "react-native-vector-icons/AntDesign";
import { windowHeight, windowWidth } from "@Util/ResponsiveView";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Colors } from "@/Constants";
import Icon from "@Assets/images/Icon";
import { useAtomValue } from "jotai";
import { singleRoom } from "@/Atoms";
import { MentionInput } from "react-native-controlled-mentions";
import { MentionInputProps } from "react-native-controlled-mentions/dist/types";

type props = {
  onClose: () => void;
  document: {
    file: DocumentPickerResponse;
    filetype: string;
    duration?: number;
  } | null;
  onMessageSend: (caption: string) => void;
  onMessageSchedule: (caption: string) => void;
};

export default function DocumentPreviewModal({ onClose, document, onMessageSend, onMessageSchedule }: props) {
  const display = useAtomValue(singleRoom);
  const MentionInputRef = useRef<MentionInputProps>(null);
  const [caption, setCaption] = useState<string>("");

  const SendButton = () => {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TouchableOpacity
          style={styles.sendContainer}
          onPress={() => {
            onMessageSend(caption.trim());
          }}
        >
          <Ionicons name="send" color="white" size={18} style={{ marginLeft: 2 }} />
        </TouchableOpacity>
        <View style={{ width: 5 }} />
        {display.roomType !== "self" &&<Pressable
          style={styles.sendContainer}
          onPress={() => {
            onMessageSchedule(caption.trim());
          }}
        >
          <Image tintColor={"white"} source={Icon.ScheduleIcon} style={{ height: 22, width: 22 }} />
        </Pressable>}
      </View>
    );
  };

  const keyBoardOffset = Platform.OS == "android" ? 46 : 100;

  return (
    <View style={styles.container}>
      <Modal
        animationIn={"slideInUp"}
        isVisible={document != null}
        onBackButtonPress={onClose}
        onBackdropPress={onClose}
      >
        <StatusBar backgroundColor="rgba(51,51,51,.9)" barStyle="light-content" />
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: "black", margin: -20 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={windowHeight / keyBoardOffset}
        >
          <View style={styles.topContainer}>
            <AntDesign name="arrowleft" color="white" size={24} onPress={onClose} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: "white", fontSize: 22 }}>{document?.file.name}</Text>
              <Text style={{ color: "white", marginTop: 10 }}>{(document?.file.size / 1024 / 1024).toFixed(2)} MB</Text>
            </View>
            <View style={{ position: "absolute", left: 10, bottom: 15 }}>
              <View style={styles.bottomcon}>
                <View style={{ flexGrow: 1 }}>
                  <View
                    style={{
                      minWidth: windowWidth - 20,
                      maxHeight: 200,
                      // marginRight: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      // marginBottom: 5,
                      backgroundColor: "rgba(51,51,51,.8)",
                      borderRadius: 30,
                      paddingHorizontal: 20,
                    }}
                  >
                    <MentionInput
                      ref={MentionInputRef}
                      maxLength={4096}
                      defaultValue={""}
                      onChange={setCaption}
                      placeholder="Add Caption"
                      placeholderTextColor="rgba(243,243,243,.6)"
                      style={{
                        height: 48,
                        paddingHorizontal: 10,
                        marginHorizontal: 10,
                        borderRadius: 6,
                        paddingTop: 13,
                        paddingBottom: 10,
                        width: windowWidth - 140,
                        color: "white",
                        fontWeight: "500",
                        zIndex: 10,
                      }}
                      partTypes={[]}
                    />
                  </View>
                </View>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View
                  style={{
                    backgroundColor: "rgba(51,51,51,.5)",
                    paddingHorizontal: 15,
                    borderRadius: 12,
                    paddingVertical: 5,
                  }}
                >
                  <Text style={{ color: "white" }}>{display.roomName}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                  <SendButton />
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "black",
    flex: 1,
    justifyContent: "center",
  },
  topContainer: {
    alignItems: "center",
    backgroundColor: "rgba(51,51,51,.9)",
    flexDirection: "row",
    height: Platform.OS == "ios" ? 90 : 50,
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingTop: Platform.OS == "ios" ? 35 : 0,
    // position: "absolute",
    width: windowWidth,
    zIndex: 100,
  },
  sendContainer: {
    alignItems: "center",
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 40,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  bottomcon: {
    alignItems: "center",
    // backgroundColor: "white",
    flexDirection: "row",
    // flexGrow: 1,
    height: 120,
    justifyContent: "space-between",
    borderRadius: 10,
    width: windowWidth - 20,
  },
});
