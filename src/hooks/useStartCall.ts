import { ReceiverType, SenderType } from "@Atoms/callAtom";
import { useCreateNewCallMutation, useGetRtmTokenMutation } from "@Service/generated/call.generated";

import { RootState } from "@Store/Reducer";
import ToastMessage from "@Util/ToastMesage";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

export type callValueType = {
  roomType: "contact" | "contact_group" | "individual" | "group";
  roomId?: string;
  type: "audio" | "video";
  participants: Array<string>;
  participantsUidData: {
    [keyName: number]: {
      name: string;
      _id: string;
    };
  };
  ParticipantsDetails: {};
  ProfileImage: string;
};

function useStartCall() {
  const { MyProfile } = useSelector((state: RootState) => state.Chat);
  const [AgoraTokenRequest, AgoraTokenResponse] = useGetRtmTokenMutation();
  const [callNotifcationRequest, callNotificationResponse] = useCreateNewCallMutation();
  const {t} = useTranslation()

  const createNewCall = useCallback(
    async (CallSender: SenderType, closeCall: () => {}) => {
      try {
        const { roomId, participants, callType, roomType } = CallSender;
        let channelName = Date.now().toString();
        let data = {
          type: callType,
          roomType,
          channelName: channelName,
          origin: MyProfile?._id,
        };
        if (roomType === "contact" || roomType === "contact_group") {
          data["participants"] = participants;
        } else {
          data["roomId"] = roomId;
          if (roomId) {
            data["participants"] = [];
          } else {
            data["participants"] = participants;
          }
        }
        console.log("create call data", JSON.stringify(data));
        const response = await callNotifcationRequest({
          variables: {
            input: data,
          },
        });
        let returnRes = undefined;
        if (response.data?.createNewCall.token) {
          const callId = response.data.createNewCall.call._id;
          if (callId) {
            returnRes = {
              callId: callId,
              token: response.data?.createNewCall.token,
              channelId: channelName,
              callType: CallSender.callType,
              roomType: CallSender.roomType,
              roomName: CallSender.roomName,
              callBackground: CallSender.callBackground,
              isReceiver: false,
              roomId: roomId,
              participants: response?.data?.createNewCall?.call?.callParticipants.map((gp) => {
                return { ...gp, micEnable: false, callStatus: "calling", pId: gp.userId._id };
              }),
            };
          } else {
            ToastMessage(response?.errors[0]?.message);
          }
        }
        return returnRes;
      } catch (error) {
        console.log("Error in creating call notification request", JSON.stringify(error));

        closeCall();
        ToastMessage(t("label.error-create-call"));
      }
    },
    [MyProfile?._id]
  );

  const joinCall = useCallback(
    async (CallReceiver: ReceiverType, closeCall: () => {}) => {
      // if(typeof(callValue.isReceiver) != undefined && callValue.isReceiver == true){

      try {
        let returnRes = null;
        let uid = CallReceiver.participants.find((cp) => cp.userId == MyProfile?._id);
        console.log("joinCall");
        let agoraRes = await AgoraTokenRequest({
          variables: {
            input: {
              uid: uid ? uid.uid : 1,
              channelName: CallReceiver.channelId,
              type: "publisher",
            },
          },
        });

        if (agoraRes.data?.getRtmToken != null) {
          const token = agoraRes.data.getRtmToken.token;

          returnRes = {
            callId: CallReceiver.callId,
            token: token,
            channelId: CallReceiver.channelName,
            callType: CallReceiver.callType,
            roomType: CallReceiver.roomType,
            roomName: CallReceiver.roomName,
            callBackground: CallReceiver.callBackground,
            isReceiver: true,
            roomId: CallReceiver?.roomId,
            participants: CallReceiver.participants.map((gp) => {
              return { ...gp, micEnable: false, callStatus: "calling", pId: gp.userId };
            }),
          };
        }
        console.log("joinCall returnRes", returnRes);
        return returnRes;
      } catch (error) {
        console.error("Error in joining call ", JSON.stringify(error));
        closeCall();
        ToastMessage(t("label.error-join-call"));
      }

      // }
    },
    [MyProfile?._id]
  );

  return {
    createNewCall,
    joinCall,
    loading: false,
  };
}

export default useStartCall;
