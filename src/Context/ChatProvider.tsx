import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { conversations } from "@/schemas/schema";
import { Conversation } from "@Models/chatmessage";
import { socketManager } from "@/utils/socket/SocketManager";
import { createStorage } from "@/utils/mmkvStorage";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  currentUserIdAtom,
  InternetAtom,
  singleRoom,
  chatSearchEnabledAtom,
  chatSearchPaginationIndexAtom,
  chatSearchResultAtom,
  chatSearchTextMessage,
  AllChatRooms,
  ArchiveRoomsAtom,
} from "@/Atoms";
import _ from "lodash";
import { produce } from "immer";
import { storage as userStore } from '../redux/backup/mmkv'
import { keys } from "@/redux/backup/keys";
// import { socketConnect } from "@/utils/socket/SocketConnection";

// Main storage for chat messages
export const storage = createStorage({
  id: "chatmessages",
});

// Separate storage for temporary search operations
export const searchStorage = createStorage({
  id: "searchmessages",
});

type UpdateMessageType =
  | "favorite"
  | "delete"
  | "react"
  | "status"
  | "read"
  | "delivered"
  | "media";

interface UpdateMessageData {
  type: UpdateMessageType;
  data: Partial<conversations>;
}

const isValidRoomId = (id: string | null | undefined): boolean => {
  return id !== null && id !== undefined && id !== "";
};

interface ChatContextState {
  conversation: conversations[];
  isFetching: boolean;
  hasMoreMessages: boolean;
  loadMoreMessages: () => void;
  setConversation: React.Dispatch<React.SetStateAction<conversations[]>>;
  isFirstLoad: boolean;
  updateMessage: (messageId: string, updateData: UpdateMessageData) => void;
  setRoomId: (roomId: string) => void;
  roomId: string;
  // Search related properties
  searchEnabled: boolean;
  searchText: string;
  searchResults: number[];
  searchPaginationIndex: number;
  performSearch: (flatListRef: React.RefObject<any>) => void;
  scrollToSearchResult: (flatListRef: React.RefObject<any>) => void;
  isSearching: boolean;
}

export const ChatContext = createContext<ChatContextState>({
  conversation: [],
  isFetching: false,
  hasMoreMessages: true,
  loadMoreMessages: () => { },
  setConversation: () => { },
  isFirstLoad: true,
  updateMessage: () => { },
  setRoomId: () => { },
  roomId: "",
  // Search related default values
  searchEnabled: false,
  searchText: "",
  searchResults: [],
  searchPaginationIndex: -1,
  performSearch: () => { },
  scrollToSearchResult: () => { },
  isSearching: false,
});

interface ChatProviderProps {
  children: React.ReactNode;
  roomId: string;
  initialPage?: number;
  messagesPerPage?: number;
}

export const ChatProvider = ({
  children,
  roomId: initialRoomId,
  initialPage = 1,
  messagesPerPage = 100,
}: ChatProviderProps) => {
  const [roomId, setRoomId] = useState(initialRoomId);
  const [conversation, setConversation] = useState<conversations[]>([]);
  const [page, setPage] = useState(initialPage);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const isFirstLoad = useRef(true);
  const conversationRef = useRef<conversations[]>(conversation);
  const roomIdRef = useRef(roomId);
  const [internet] = useAtom(InternetAtom);
  const MyProfile: any = useAtomValue(currentUserIdAtom);
  const display: any = useAtomValue(singleRoom);

  // Search related atoms
  const searchEnabled = useAtomValue(chatSearchEnabledAtom);
  const [searchResults, setSearchResults] = useAtom(chatSearchResultAtom);
  const searchPaginationIndex = useAtomValue(chatSearchPaginationIndexAtom);
  const searchText = useAtomValue(chatSearchTextMessage);
  const [isSearching, setIsSearching] = useState(false);

  // Track if we're in search mode to handle conversation state changes
  const [isInSearchMode, setIsInSearchMode] = useState(false);

  const setChatRooms = useSetAtom(AllChatRooms);
  const setArchiveRooms = useSetAtom(ArchiveRoomsAtom);

  // Track search request to avoid race conditions
  const searchRequestRef = useRef<any>(null);
  useEffect(() => {
    if (!display?.roomId) return;
    // Adding Offline Messages here
    const offline_messages = storage.getString(
      `conversations_${display?.roomId}`
    );
    if (offline_messages) {
      const parsedChatList = offline_messages
        ? JSON.parse(offline_messages)
        : [];
      if (parsedChatList.length > 0) {
        setConversation([...parsedChatList]);
      }
    }
    // Added Offline Messages above
  }, [display?.roomId, roomId]);

  useEffect(() => {
    if (!internet) return;
    // Flush queued (offline) messages when connectivity/socket comes back.
    socketManager.conversation.flushOutbox?.();
    const intervalId = setInterval(() => {
      socketManager.conversation.flushOutbox?.();
    }, 3000);
    return () => clearInterval(intervalId);
  }, [internet]);

  const getConversations = useCallback(
    (page: number) => {
      if (!isValidRoomId(roomId)) return;

      setIsFetching(true);
      let isCompleted = false;
      const timeoutId = setTimeout(() => {
        if (isCompleted) return;
        isCompleted = true;
        isFirstLoad.current = false;
        setIsFetching(false);
      }, 10000);

      socketManager.chatRoom
        .getChatMeesagesByDays(roomId, page, messagesPerPage, (data) => {
          if (isCompleted) return;
          isCompleted = true;
          clearTimeout(timeoutId);

          if (data?.chats) {
            let chats = _.uniqBy(
              [...data.chats, ...conversationRef.current],
              "_id"
            );
            storage.set(
              `conversations_${roomIdRef.current}`,
              JSON.stringify(chats.slice(0, messagesPerPage))
            );
            setConversation(chats);
            conversationRef.current = chats;
          }
          isFirstLoad.current = false;
          setIsFetching(false);
        })
        .catch((error) => {
          console.error("Error fetching conversations:", error);
          if (isCompleted) return;
          isCompleted = true;
          clearTimeout(timeoutId);
          isFirstLoad.current = false;
          setIsFetching(false);
        });
    },
    [roomId, messagesPerPage]
  );

  useEffect(() => {
    if (display && display?.roomId == roomId) {
      const totalPages = Math.ceil(display?.totalChats / messagesPerPage);
      console.log("totalPages--------->", display?.totalChats, totalPages);
      setTotalPages(totalPages);
    }
  }, [display, messagesPerPage]);

  useEffect(() => {
    conversationRef.current = conversation;
    if (roomId && !isInSearchMode && conversation.length > 0) {
      storage.set(
        `conversations_${roomIdRef.current}`,
        JSON.stringify(conversation.slice(0, 100))
      );
    }
  }, [conversation, roomId, isInSearchMode]);

  useEffect(() => {
    const unsubscribe = socketManager.conversation.onMessage((data) => {
      const type = data?.type;

      if (
        type === "sendChat" ||
        type === "newMessage" ||
        type === "deleteChat"
      ) {
        // Always update the room list regardless of which room user is in
        socketManager.chatRoom.fetchAndUpdateRooms((data) => {
          if (!data.rooms) {
            console.error("Room update error: Missing rooms");
            return;
          }
          const archives = data.rooms.filter((room: any) => room.isArchived);

          setArchiveRooms(archives);
          setChatRooms(data.rooms);
        });
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const resolveMessageKey = (message: any): string => {
      return String(
        message?.id_local ??
          message?.local_Id ??
          message?._id ??
          message?.server_id ??
          `${message?.sender ?? ""}_${message?.created_at ?? Date.now()}`
      );
    };

    // Helper function to add or update a message
    const addOrUpdateMessage = (newMessage: any) => {
      const incomingKey = resolveMessageKey(newMessage);
      const incomingLocalId = String(
        newMessage?.id_local ?? newMessage?.local_Id ?? ""
      );
      const currentUserId = String(userStore.getString(keys.userId) ?? "");
      const updatedChats = produce(conversationRef.current, draft => {
        const existingIndex = draft.findIndex(
          (msg: any) => {
            if (resolveMessageKey(msg) === incomingKey) return true;
            const currentLocalId = String(msg?.id_local ?? msg?.local_Id ?? "");
            return (
              incomingLocalId.length > 0 &&
              currentLocalId.length > 0 &&
              incomingLocalId === currentLocalId
            );
          }
        );
        const mergedMessage =
          existingIndex === -1
            ? { ...newMessage }
            : { ...draft[existingIndex], ...newMessage };

        const isSelfMessage =
          String(mergedMessage?.sender ?? "") === currentUserId;

        // Server events often omit isSent; for own messages treat merged/acked
        // records as sent so pending watch icon flips to check.
        if (isSelfMessage && typeof mergedMessage?.isSent !== "boolean") {
          mergedMessage.isSent = true;
        }

        if (isSelfMessage && mergedMessage?.isSent) {
          mergedMessage.sendFailed = false;
        }

        if (existingIndex === -1) {
          draft.unshift(mergedMessage);
        } else {
          draft[existingIndex] = mergedMessage;
        }
      });
      // Important: keep ref in sync immediately to avoid race when many socket events arrive at once.
      conversationRef.current = updatedChats as any;
      return updatedChats;
    };

    // Helper function to update conversation state
    const updateConversation = (updater: (draft: any[]) => void) => {
      const updatedChats = produce(conversationRef.current, updater);
      conversationRef.current = updatedChats as any;
      setConversation(updatedChats);
    };

    const unwrapSocketMessage = (data: any) => data?.msg ?? data;

    const isCurrentRoomMessage = (message: any) => {
      const messageRoomId = message?.roomId;
      return (
        messageRoomId != null &&
        String(messageRoomId) === String(roomIdRef.current)
      );
    };

    // Message handlers
    const messageHandlers = {
      sendChat: (data: any) => {
        const message = unwrapSocketMessage(data);
        if (!isCurrentRoomMessage(message)) return;

        const newMessage = {
          ...message,
          _id:
            message?._id ||
            message?.id_local ||
            message?.local_Id ||
            Date.now().toString(),
        };

        const chats = addOrUpdateMessage(newMessage);
        setConversation(chats);
      },

      onDeleteChat: (data: any) => {
        const msg = unwrapSocketMessage(data);
        if (!isCurrentRoomMessage(msg)) return;

        console.log("delete Chat ----------> ", data);

        const { cid: messageId, user_id: userId, type: deleteType } = msg;

        updateConversation(draft => {
          const messageIndex = draft.findIndex(msg => msg._id === messageId);

          if (messageIndex !== -1) {
            const message = draft[messageIndex];

            if (!Array.isArray(message.deleted)) {
              message.deleted = [];
            }

            const existingDeleteIndex = message.deleted.findIndex(
              del => del.user_id === userId
            );

            const deleteEntry = {
              type: deleteType,
              cause: "deleted",
              user_id: userId,
              deleted_at: Date.now()
            };

            if (existingDeleteIndex !== -1) {
              message.deleted[existingDeleteIndex] = deleteEntry;
            } else {
              message.deleted.push(deleteEntry);
            }
          }
        });
      },

      newMessage: (data: any) => {
        const rawMessage = unwrapSocketMessage(data)?.message ?? unwrapSocketMessage(data);
        const message =
          typeof rawMessage === "string" ? JSON.parse(rawMessage) : rawMessage;

        if (!isCurrentRoomMessage(message)) return;

        const newMessage = {
          ...message,
          _id:
            message?._id ||
            message?.id_local ||
            message?.local_Id ||
            Date.now().toString(),
        };

        const chats = addOrUpdateMessage(newMessage);
        const id = userStore.getString(keys.userId);

        if (message.sender !== id) {
          socketManager.conversation.markMessagesRead(roomId, message._id);
        }

        setConversation(chats);
      },

      MarkSeen: (data: any) => {
        const msg = unwrapSocketMessage(data);
        if (!isCurrentRoomMessage(msg)) return;

        const { cid: targetMessageIds, data: msgData } = msg;
        const { user_id: userId, read_at: readAt } = msgData;

        updateConversation(draft => {
          draft.forEach(msg => {
            if (targetMessageIds.includes(msg._id)) {
              if (!Array.isArray(msg.read_by)) {
                msg.read_by = [];
              }

              const existingIndex = msg.read_by.findIndex(r => r.user_id === userId);
              if (existingIndex !== -1) {
                msg.read_by.splice(existingIndex, 1);
              }

              msg.read_by.push({ user_id: userId, read_at: readAt });
            }
          });
        });
      },

      updateMessage: (data: any) => {
        const msg = unwrapSocketMessage(data);
        updateConversation(draft => {
          const messageIndex = draft.findIndex(
            cr =>
              String(cr._id) === String(msg?._id) ||
              String(cr.id_local ?? cr.local_Id ?? "") ===
                String(msg?.id_local ?? msg?.local_Id ?? "")
          );
          if (messageIndex !== -1) {
            draft[messageIndex] = { ...draft[messageIndex], ...msg };
          }
        });
      },

      poll: (data: any) => {
        const msg = unwrapSocketMessage(data);
        updateConversation(draft => {
          const messageIndex = draft.findIndex(cr => cr._id === msg?._id);
          if (messageIndex !== -1) {
            draft[messageIndex] = msg;
          }
        });
      },
      clearAllChats: (data: any) => {
        const clearedRoomId = data?.msg?.roomId || data?.roomId;
        if (!clearedRoomId || clearedRoomId !== roomIdRef.current) return;

        setConversation([]);
        conversationRef.current = [];
        storage.delete(`conversations_${roomIdRef.current}`);
      },
      clearAllChat: (data: any) => {
        const clearedRoomId = data?.msg?.roomId || data?.roomId;
        if (!clearedRoomId || clearedRoomId !== roomIdRef.current) return;

        setConversation([]);
        conversationRef.current = [];
        storage.delete(`conversations_${roomIdRef.current}`);
      },
    };

    if (isValidRoomId(roomId)) {
      roomIdRef.current = roomId;

      console.log("Registering message handler for roomId:", roomId);

      unsubscribe = socketManager.conversation.onMessage((data) => {
        // console.log("Socket message event received in handler:", data?.type);

        const handler = messageHandlers[data.type as keyof typeof messageHandlers];
        if (handler) {
          handler(data);
        }
      });
    }

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [roomId]);

  const loadMoreMessages = useCallback(() => {
    if (!isValidRoomId(roomId)) return;
    if (!isFetching && totalPages > page) {
      getConversations(page + 1);
      setPage((prevPage) => prevPage + 1);
    }
  }, [totalPages, page, getConversations, isFetching, roomId]);

  const handleFavoriteUpdate = (
    message: conversations
  ): Partial<conversations> => {
    const currentFavoriteBy = message.favourite_by || [];
    const isFavorite = currentFavoriteBy.some(
      (fav: any) => fav.user_id === MyProfile._id
    );
    const updatedFavoriteBy = isFavorite
      ? currentFavoriteBy.filter((fav) => fav.user_id !== MyProfile._id)
      : [
        ...currentFavoriteBy,
        { user_id: MyProfile?._id, favourite_at: Date.now() },
      ];
    return { favourite_by: updatedFavoriteBy, updated_at: Date.now() };
  };

  const handleDeleteUpdate = (
    message: conversations,
    data: conversations
  ): Partial<conversations> => {
    const currentDeleted = message.deleted || [];
    const alreadyDeleted = currentDeleted.some(
      (entry) => entry.user_id === MyProfile._id
    );

    if (alreadyDeleted) {
      return {};
    }

    const updatedDeleted = [
      ...currentDeleted,
      {
        user_id: MyProfile?._id,
        deleted_at: Date.now(),
        type: data?.type,
        cause: data?.cause,
      },
    ];

    console.log("deleted Message: ", {
      deleted: updatedDeleted,
      updated_at: Date.now(),
    });
    return { deleted: updatedDeleted, updated_at: Date.now() };
  };

  const handleMediaUpdate = (
    message: conversations,
    data: conversations
  ): Partial<conversations> => {
    const newMessage = {
      ...message,
      ...data,
    };
    return newMessage;
  };

  const updateMessage = useCallback(
    (messageId: string | string[], { type, data }: UpdateMessageData) => {
      if (!isValidRoomId(roomId) || !MyProfile?._id) {
        console.warn(
          "Update message called with invalid roomId or missing profile ID"
        );
        return;
      }
      const currentConversation = conversationRef.current;
      let hasChanged = false;

      const updatedConversation = currentConversation.map((message) => {
        const shouldUpdate = Array.isArray(messageId)
          ? messageId.includes(message._id)
          : message._id === messageId;

        if (!shouldUpdate) {
          return message;
        }

        let updatedFields: Partial<conversations> = {};
        switch (type) {
          case "favorite":
            updatedFields = handleFavoriteUpdate(message);
            break;
          case "delete":
            updatedFields = handleDeleteUpdate(message, data);
            break;
          case "media":
            updatedFields = handleMediaUpdate(message, data);
            break;

          default:
            updatedFields = { ...data, updated_at: Date.now() };
            break;
        }

        if (Object.keys(updatedFields).length > 0) {
          hasChanged = true;
          return { ...message, ...updatedFields };
        }

        return message;
      });

      if (hasChanged) {
        storage.set(
          `conversations_${roomIdRef.current}`,
          JSON.stringify(updatedConversation.slice(0, messagesPerPage))
        );
        conversationRef.current = updatedConversation;
        setConversation(updatedConversation);
      }
    },
    [messagesPerPage, roomId, MyProfile?._id]
  );

  useEffect(() => {
    if (!isValidRoomId(roomId)) {
      setConversation([]);
      conversationRef.current = [];
      return;
    }

    setPage(1);
    setHasMoreMessages(true);
    isFirstLoad.current = true;
    getConversations(1);
  }, [roomId, getConversations]);

  /**
   * Save original conversation to MMKV storage before search
   */
  const saveOriginalConversation = useCallback(() => {
    if (conversation && conversation.length > 0) {
      searchStorage.set(
        `original_conversation_${roomId}`,
        JSON.stringify(conversation)
      );
    }
  }, [conversation, roomId]);

  /**
   * Restore original conversation from storage
   */
  const restoreOriginalConversation = useCallback(() => {
    try {
      const savedConversation = searchStorage.getString(
        `original_conversation_${roomId}`
      );
      if (savedConversation) {
        const parsedConversation = JSON.parse(savedConversation);
        setConversation(parsedConversation);
        conversationRef.current = parsedConversation;

        // Clear the search storage after restoration
        searchStorage.delete(`original_conversation_${roomId}`);
      } else {
        // If no saved conversation exists, reload from server
        console.log("No saved conversation found, reloading from server");
        getConversations(1);
        setPage(1);
      }
    } catch (error) {
      console.error("Error restoring original conversation:", error);
      // Fallback to server fetch
      getConversations(1);
      setPage(1);
    }
  }, [roomId, getConversations]);

  /**
   * Performs a search against the conversation messages
   * Updates conversation directly with search results
   */
  const searchMessages = useCallback(async () => {
    // Reset if search criteria is insufficient
    if (!searchText || searchText.length < 2 || !roomId || !MyProfile?._id) {
      // If we're already in search mode, restore original conversation
      if (isInSearchMode) {
        restoreOriginalConversation();
        setIsInSearchMode(false);
      }
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);

      // If this is first search, save original conversation
      if (!isInSearchMode) {
        saveOriginalConversation();
        setIsInSearchMode(true);
      }

      // Cancel any existing search request to avoid race conditions
      if (searchRequestRef.current) {
        clearTimeout(searchRequestRef.current);
      }

      // Create a promise with timeout for search
      const searchWithTimeout = (ms: number) => {
        return new Promise((resolve, reject) => {
          // Store the timeout ID so we can cancel it if needed
          const timeoutId = setTimeout(() => {
            reject(new Error("Search request timed out"));
          }, ms);

          console.log(
            `Searching for "${searchText}" in room ${roomId} (skip: 0, limit: 1000)`
          );

          socketManager.conversation
            .searchChatsByRoomId(roomId, MyProfile._id, searchText, 0, 1000)
            .then((results) => {
              clearTimeout(timeoutId);
              resolve(results);
            })
            .catch((error) => {
              clearTimeout(timeoutId);
              reject(error);
            });
        });
      };

      // Perform server-side search with 10 second timeout
      const serverResults: any = await searchWithTimeout(10000);

      // If server returned results, update conversation directly
      if (
        serverResults?.chats &&
        Array.isArray(serverResults?.chats) &&
        serverResults?.chats.length > 0
      ) {
        // Update conversation with search results
        setSearchResults(serverResults?.chats);

        // Keep track of indices for scrolling/highlighting
        // const indices = serverResults.map((_, index) => index);
        // setSearchResults(indices);
        // console.log(`Found ${indices.length} search results`);
      } else {
        console.log("No search results found");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching messages:", error);

      // Fallback to local search if server search fails
      const localResults = conversation.filter(
        (message) =>
          message.message &&
          typeof message.message === "string" &&
          message.message.toLowerCase().includes(searchText.toLowerCase())
      );

      if (localResults.length > 0) {
        // Update conversation with local search results
        setSearchResults(localResults);

        // Keep track of indices for scrolling/highlighting
        // const indices = localResults.map((_, index) => index);
        // setSearchResults(indices);
        // console.log(`Found ${indices.length} local search results`);
      } else {
        console.log("No local search results found");
        setSearchResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  }, [
    conversation,
    searchText,
    roomId,
    MyProfile?._id,
    internet,
    isInSearchMode,
    saveOriginalConversation,
    restoreOriginalConversation,
    setSearchResults,
  ]);

  // Watch for search enabled/disabled changes
  useEffect(() => {
    if (!searchEnabled && isInSearchMode) {
      // When search is disabled, restore original conversation
      restoreOriginalConversation();
      setIsInSearchMode(false);
      setSearchResults([]);
    } else if (searchEnabled && searchText && searchText.length >= 2) {
      // If search is enabled and has sufficient text, trigger search
      searchMessages();
    }
  }, [
    searchEnabled,
    isInSearchMode,
    restoreOriginalConversation,
    searchText,
    searchMessages,
  ]);

  // Debounce the search to prevent excessive processing
  const debouncedSearch = useCallback(
    _.debounce(() => {
      if (searchEnabled && searchText && searchText.length >= 2) {
        searchMessages();
      }
    }, 400), // Increased debounce time to reduce frequency of searches
    [searchMessages, searchEnabled, searchText]
  );

  // Trigger search when relevant dependencies change
  useEffect(() => {
    if (searchEnabled && searchText && searchText.length >= 2) {
      debouncedSearch();
    }
    return () => {
      debouncedSearch.cancel();
      // Cancel any pending search request
      if (searchRequestRef.current) {
        clearTimeout(searchRequestRef.current);
      }
    };
  }, [searchText, searchEnabled, debouncedSearch]);

  /**
   * Scroll to the active search result
   */
  const scrollToSearchResult = useCallback(
    (flatListRef: React.RefObject<any>) => {
      if (
        searchEnabled &&
        searchText.length > 0 &&
        searchResults.length > 0 &&
        searchPaginationIndex >= 0 &&
        searchPaginationIndex < searchResults.length &&
        flatListRef?.current
      ) {
        const targetIndex = searchResults[searchPaginationIndex];

        setTimeout(() => {
          try {
            flatListRef.current.scrollToIndex({
              index: targetIndex,
              animated: true,
              viewPosition: 0.5, // Center the item
            });
          } catch (error) {
            console.error("Error scrolling to search result:", error);
          }
        }, 200);
      }
    },
    [searchEnabled, searchText, searchResults, searchPaginationIndex]
  );

  // Perform search and scrolling
  const performSearch = useCallback(
    _.debounce((flatListRef: React.RefObject<any>) => {
      if (!flatListRef?.current) return;
      scrollToSearchResult(flatListRef);
    }, 300),
    [scrollToSearchResult]
  );

  // When component unmounts or roomId changes, clean up search state
  useEffect(() => {
    return () => {
      if (isInSearchMode) {
        searchStorage.delete(`original_conversation_${roomId}`);
        setIsInSearchMode(false);
      }
    };
  }, [roomId, isInSearchMode]);

  const value = {
    conversation,
    isFetching,
    hasMoreMessages,
    loadMoreMessages,
    setConversation,
    isFirstLoad: isFirstLoad.current,
    updateMessage,
    setRoomId,
    roomId,
    // Search related values
    searchEnabled,
    searchText,
    searchResults,
    searchPaginationIndex,
    performSearch,
    scrollToSearchResult,
    isSearching,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatProvider;
