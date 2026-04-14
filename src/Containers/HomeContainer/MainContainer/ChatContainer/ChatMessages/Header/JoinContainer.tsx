import { Text, View } from "react-native";
import { callFullScreenState, callMiniScreenState } from "@Atoms/GlobalCallController";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import { IOngoingCall } from "@Atoms/callActiveStatusAtom";
import InCallButton from "../../../CallContainer/components/InCallButtton";
import JoinCallButton from "../../../CallContainer/components/JoinCallButton";
import React from "react";
import ToastMessage from "@Util/ToastMesage";
import { callAtom } from "@Atoms/callAtom";
import { checkCallPermissions } from "@Util/permission";
import { singleRoom } from "@Atoms/singleRoom";
import { useTranslation } from "react-i18next";

type joinContainerProps = {
  data: IOngoingCall;
};

export default function JoinContainer({ data }: joinContainerProps) {
  const [callRequest, setCallRequest] = useAtom(callAtom);
  const toggleFullScreenMode = useSetAtom(callFullScreenState);
  const toggleMiniScreenMode = useSetAtom(callMiniScreenState);
  const display = useAtomValue(singleRoom);
  const { t } = useTranslation();

  return (
    <View style={{ marginRight: 10 }}>
      {callRequest?.roomId != data.roomId ? (
        <JoinCallButton
          onPress={async () => {
            //user is not in call already so he can join the call
            const res = await checkCallPermissions(data?.type === "audio" ? "audio" : "video");
            if (res === true) {
              if (callRequest == null) {
                const partipantsData = data?.callParticipants.map((e) => {
                  if (e.userId._id) {
                    return {
                      ...e.userId,
                      userId: e.userId._id,
                      uid: e.uid,
                    };
                  }
                  return e;
                });

                setCallRequest({
                  roomName: display.roomName,
                  roomId: display?.roomId,
                  isReceiver: true,
                  callId: data?._id,
                  channelId: data?.channelName,
                  channelName: data?.channelName,
                  callType: data?.type,
                  roomType: data?.roomType,
                  participants: partipantsData,
                  callBackground: display?.roomWallpaper.url,
                });
              } else {
                if (callRequest.roomId == data?.roomId?._id) {
                  toggleFullScreenMode(true);
                  toggleMiniScreenMode(false);
                } else {
                  ToastMessage(`${t("toastmessage.already-incall-canjoin")}`);
                }
              }
            }
          }}
        />
      ) : (
        <InCallButton />
      )}
    </View>
  );
}
