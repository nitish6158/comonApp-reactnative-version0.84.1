import React, { useState } from "react";

import { Block } from "rnmuilib";
import Dialog from "react-native-dialog";
import { useAcceptRejectVideoRequestMutation } from "@Service/generated/call.generated";
import useEventEmitter from "@Hooks/useEventEmitter";

export const VIDEO_CALL_REQUEST = "VIDEO_CALL_REQUEST";
export const VIDEO_CALL_REQUEST_ACCEPTED = "VIDEO_CALL_REQUEST_ACCEPTED";
export const VIDEO_CALL_REQUEST_REJECTED = "VIDEO_CALL_REQUEST_REJECTED";

function SwitchToVideoPromt({ switchToVideoCall, videoCallRejected }: any) {
  const [callData, setCallData]: any = useState({});
  const [showPromt, setShowPromt] = useState(false);
  const [acceptRejectVideoRequest] = useAcceptRejectVideoRequestMutation();

  useEventEmitter(VIDEO_CALL_REQUEST, (options) => {
    setShowPromt(true);
    setCallData(options);
  });

  useEventEmitter(VIDEO_CALL_REQUEST_REJECTED, () => {
    videoCallRejected();
  });

  return (
    <Block>
      <Dialog.Container visible={showPromt}>
        <Dialog.Title>Video call request</Dialog.Title>
        <Dialog.Description>{`${callData?.origin?.firstName} is requesting to switch to video call...`}</Dialog.Description>
        <Dialog.Button
          onPress={async () => {
            await acceptRejectVideoRequest({
              variables: {
                input: {
                  callId: callData?._id,
                  status: "accepted",
                  userId: callData?.userId,
                },
              },
            }).then(() => {
              setShowPromt(false);
              switchToVideoCall();
            });
          }}
          label="Accept"
        />
        <Dialog.Button
          onPress={async () => {
            await acceptRejectVideoRequest({
              variables: {
                input: {
                  callId: callData?._id,
                  status: "rejected",
                  userId: callData?.userId,
                },
              },
            }).then(() => {
              setShowPromt(false);
            });
          }}
          style={{ color: "red" }}
          label="Reject"
        />
      </Dialog.Container>
    </Block>
  );
}

export default SwitchToVideoPromt;
