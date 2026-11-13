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

  const updateChatMessage = useCallback(async (payload: UdpateChatInput): Promise<UpdateChatMutation["updateChat"]> => {
    const response = await updateChat({ variables: { input: payload } });
    if (response.errors) {
      throw new Error(response.errors.map((e) => e.message).join(", "));
    }
    return response.data?.updateChat;
  }, [updateChat]);

  const sendBroadcastChat = useCallback(
    async (payload: SendChatInput): Promise<SendBroadcastChatMutation["sendBroadcastChat"]> => {
      const response = await sendBroadcast({ variables: { input: payload } });
      if (response.errors) {
        throw new Error(response.errors.map((e) => e.message).join(", "));
      }
      return response.data?.sendBroadcastChat;
    },
    [sendBroadcast]
  );

  const sendChatToRooms = useCallback(async (payload: SendChatInput): Promise<SendChatMutation["sendChat"]> => {
    const res = await sendChat({ variables: { input: payload } });
    if (res.errors) {
      throw new Error(res.errors.map((e) => e.message).join(", "));
    }
    return res.data?.sendChat;
  }, [sendChat]);

  return {
    updateChatMessage,
    sendBroadcastChat,
    sendChatToRooms,
  };
}
