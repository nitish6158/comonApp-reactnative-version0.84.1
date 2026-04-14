import {
  SendBroadcastChatMutation,
  SendChatMutation,
  UpdateChatMutation,
  useSendBroadcastChatMutation,
  useSendChatMutation,
  useUpdateChatMutation,
} from "@/graphql/generated/room.generated";
import { SendChatInput, UdpateChatInput } from "@/graphql/generated/types";
import React, { useCallback } from "react";

export default function useUpdateChat() {
  const [updateChat] = useUpdateChatMutation();
  const [sendBroadcast] = useSendBroadcastChatMutation();
  const [sendChat] = useSendChatMutation();

  const updateChatMessage = useCallback((payload: UdpateChatInput): Promise<UpdateChatMutation["updateChat"]> => {
    return new Promise((resolve, reject) => {
      updateChat({
        variables: {
          input: payload,
        },
      })
        .then((response) => {
          if (response.errors) return reject(response.errors);
          if (response.data?.updateChat) return resolve(response.data.updateChat);
        })
        .catch((Err) => reject(Err));
    });
  }, []);

  const sendBroadcastChat = useCallback(
    (payload: SendChatInput): Promise<SendBroadcastChatMutation["sendBroadcastChat"]> => {
      return new Promise((resolve, reject) => {
        sendBroadcast({
          variables: {
            input: payload,
          },
        })
          .then((response) => {
            if (response.errors) return reject(response.errors);
            return resolve(response.data?.sendBroadcastChat);
          })
          .catch((err) => reject(err));
      });
    },
    []
  );

  const sendChatToRooms = useCallback(async (payload: SendChatInput): Promise<SendChatMutation["sendChat"]> => {
    return new Promise((resolve, reject) => {
      sendChat({
        variables: {
          input: payload,
        },
      })
        .then((res) => {
          if (res.errors) return reject(res.errors);
          return resolve(res.data?.sendChat);
        })
        .catch((err) => reject(err));
    });
  }, []);

  return {
    updateChatMessage,
    sendBroadcastChat,
    sendChatToRooms,
  };
}
