import { useState, useEffect, useCallback, useRef } from "react";
import { conversations } from "@/schemas/schema";
import { Conversation } from "@Models/chatmessage";
import _ from "lodash";
import { Hidemessage } from "@Types/types";
import { socketManager } from "@/utils/socket/SocketManager";
import { createStorage } from "@/utils/mmkvStorage";
import { useAtom } from "jotai";
import { InternetAtom } from "@/Atoms";

// Removed WatermelonDB imports and database references

const storage = createStorage({
  id: "chatmessages",
});

/**
 * Custom hook for handling chat pagination and data fetching
 *
 * @param roomId - The ID of the chat room
 * @param currentUserUtility - Current user's utility information
 * @param initialPage - Initial page number for pagination
 * @returns Chat data and pagination controls
 */
export const useChat = (
  roomId: string,
  currentUserUtility: any,
  initialPage = 1,
  messagesPerPage = 100
) => {
  const [conversation, setConversation] = useState<conversations[]>([]);
  const [page, setPage] = useState(initialPage);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const isFirstLoad = useRef(true);
  const conversationRef = useRef<Conversation[]>([]);
  const roomIdRef = useRef(roomId);
  const [internet] = useAtom(InternetAtom);


  const getConversations = async (page: number) => {
    socketManager.chatRoom.getChatMeesagesByDays(
      roomId,
      page,
      messagesPerPage,
      (data) => {
        console.log(
          "=======---------=>",
          roomIdRef.current,
          roomId
          //   page,
          //   data.chats.length,
          //   data.pagination
        );
        if (data.chats) {
          setTotalPages(data.pagination.totalPages);
          setPage(data.pagination.currentPage);
          let chats = _.uniqBy(
            [...conversationRef.current, ...data.chats],
            "_id"
          );
          storage.set(
            `conversations_${roomIdRef.current}`,
            JSON.stringify(chats.slice(0, messagesPerPage))
          );
          setConversation(chats);
          conversationRef.current = chats;
        }
      }
    );
  };

  // Set up observer for real-time updates
  useEffect(() => {
    let isMounted = true;
    let unsubscribe = null;

    if (roomId) {
      unsubscribe = socketManager.conversation.onNewMessage((data) => {
        console.log("New Message", roomId);
        if (data?.message) {
          let message = JSON.parse(data.message);
          console.log(message, conversationRef.current.length);
          if (message.roomId === roomIdRef.current) {
            let chats = [message, ...conversationRef.current];
            storage.set(
              `conversations_${roomIdRef.current}`,
              JSON.stringify(chats.slice(0, messagesPerPage))
            );
            console.log("chats", chats.length);
            setConversation(chats);
            conversationRef.current = chats;
          }
        }
      });
      let chats = storage.getString(`conversations_${roomId}`);
      if (chats) {
        let chatsa = JSON.parse(chats);
        console.log(chatsa.length);
        setConversation(chatsa);
        conversationRef.current = chatsa;
      }

      getConversations(page);
    }

    return () => {
      isMounted = false;
      setConversation([]);
      conversationRef.current = [];
      setPage(1);
      isFirstLoad.current = true;
      roomIdRef.current = ""
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [roomId]);

  // Load more messages function with throttling
  const loadMoreMessages = () => {
    if (totalPages > page) {
      setPage((prevPage) => prevPage + 1);
      getConversations(page + 1);
    }
  };

  // Reset pagination when room changes
  useEffect(() => {
    setPage(1);
    setHasMoreMessages(true);
    isFirstLoad.current = true;
  }, [roomId]);

  return {
    conversation,
    isFetching,
    hasMoreMessages,
    loadMoreMessages,
    setConversation,
    isFirstLoad: isFirstLoad.current,
  };
};
