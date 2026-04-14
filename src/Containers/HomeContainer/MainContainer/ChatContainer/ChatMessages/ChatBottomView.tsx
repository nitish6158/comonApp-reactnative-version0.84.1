import { Dimensions, KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
import {
  IsAudioRecordingVisibleAtom,
  MultiSelectionAtom,
  chatSearchEnabledAtom,
  chatSearchPaginationIndexAtom,
  chatSearchResultAtom,
} from "@Atoms/ChatMessageEvents";
//import liraries
import React, { useMemo } from "react";

import AudioRecording from "@/Containers/HomeContainer/MainContainer/ChatContainer/ChatMessages/AudioRecording";
import Colors from "@/Constants/Colors";
import Entypo from "react-native-vector-icons/Entypo";
import MultiSelectionBottomBar from "@/Containers/HomeContainer/MainContainer/ChatContainer/ChatMessages/MultiSelectionBottomBar";
import { RootState } from "@Store/Reducer/index";
import SendChatContainer from "@/Containers/HomeContainer/MainContainer/ChatContainer/ChatMessages/SendChatContainer";
import { callAtom } from "@Atoms/callAtom";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import useKeyboardPadding from "./useKeyboardPadding";

const { height } = Dimensions.get("window");

// create a component
export default function ChatBottomView() {
  const [audioRecordVisible, setAudioRecordVisible] = useAtom(
    IsAudioRecordingVisibleAtom,
  );
  const [searchEnable, setSearchenable] = useAtom(chatSearchEnabledAtom);
  const [isMultiSelection, setMultiSelection] = useAtom(MultiSelectionAtom);

  const { t } = useTranslation();

  const [display] = useAtom(singleRoom);
  const [callRequest] = useAtom(callAtom);

  const keyboardPadding = useKeyboardPadding();

  const keyBoardOffset = useMemo(() => {
    return Platform.OS == "android" ? 40 : callRequest != null ? 10 : 15;
  }, []);

  if (audioRecordVisible) {
    return (
      <AudioRecording
        autoStart={true}
        isRecording={audioRecordVisible}
        onpressCancel={() => {
          setAudioRecordVisible(false);
        }}
      />
    );
  }

  if (searchEnable || isMultiSelection) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={height / keyBoardOffset}
      >
        <SearchEnableView isVisible={searchEnable} />
        <MultiSelectionView isVisible={isMultiSelection} />
      </KeyboardAvoidingView>
    );
  } else {
    if (display.isCurrentRoomBlocked) {
      return (
        <View
          style={{
            height: 90,
            backgroundColor: Colors.light.LightBlue,
            justifyContent: "center",
          }}
        >
          <Text
            style={{ color: Colors.light.Hiddengray, textAlign: "center" }}
            lineNumber={10}
          >
            {t("blockedUser")}
          </Text>
        </View>
      );
    } else if (
      display.currentUserUtility.left_at > 0 &&
      display.roomType !== "individual"
    ) {
      return (
        <View
          style={{
            height: 80,
            backgroundColor: Colors.light.LightBlue,
            justifyContent: "center",
            paddingHorizontal: 20,
          }}
        >
          <Text
            style={{
              color: Colors.light.Hiddengray,
              textAlign: "center",
              maxWidth: 400,
            }}
            lineNumber={3}
          >
            {t("noLongerParticipant")}
          </Text>
        </View>
      );
    } else {
      return (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={height / keyBoardOffset}
        >
          <View style={{ paddingBottom: keyboardPadding }}>
            {canSendMessage(display) ? (
              <SendChatContainer />
            ) : (
              <View
                style={{
                  height: 40,
                  backgroundColor: Colors.light.LightBlue,
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: Colors.light.Hiddengray,
                    textAlign: "center",
                  }}
                  lineNumber={2}
                >
                  {t("onlyAdminMsg")}
                </Text>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      );
    }
  }
}

function canSendMessage(display) {
  if (display.roomType == "self") {
    return true;
  }
  return (
    display?.roomPermission?.SendMessagePermission?.permit ==
      display.currentUserUtility.user_type ||
    display.currentUserUtility.user_type == "admin" ||
    display.roomType == "individual"
  );
}

function SearchEnableView({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null;
  } else {
    // return <ChatSearchBottomBar />;
    return <></>;
  }
}

function MultiSelectionView({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null;
  } else {
    return <MultiSelectionBottomBar />;
  }
}

function ChatSearchBottomBar() {
  const [SearchResult, setSearchResult] = useAtom(chatSearchResultAtom);
  const [chatSearchPaginationIndex, setChatSearchPaginationIndex] = useAtom(
    chatSearchPaginationIndexAtom,
  );

  const { t } = useTranslation();

  const scrollDownfun = () => {
    if (chatSearchPaginationIndex > 1) {
      setChatSearchPaginationIndex((old: number) => old - 1);
    }
  };
  const scrollUpfun = () => {
    if (chatSearchPaginationIndex < SearchResult?.length) {
      setChatSearchPaginationIndex((old: number) => old + 1);
    }
  };

  return (
    <View
      style={[
        {
          backgroundColor: Colors.light.LightBlue,
          height: 60,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          borderBottomColor: "black",
          borderBottomWidth: 0.2,
        },
        SearchResult?.length == 0 && { justifyContent: "center" },
      ]}
    >
      <Text style={{ textAlign: "center" }} size="md">
        {SearchResult?.length > 0 ? chatSearchPaginationIndex : 0} of{" "}
        {SearchResult?.length ?? 0} {t("matches")}
      </Text>
      {SearchResult?.length > 0 && (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={() => {
              scrollDownfun();
            }}
          >
            <Entypo size={35} name="chevron-small-down" />
          </Pressable>
          <Pressable
            onPress={() => {
              scrollUpfun();
            }}
          >
            <Entypo size={35} name="chevron-small-up" />
          </Pressable>
        </View>
      )}
    </View>
  );
}
