import { useEffect, useCallback, useMemo, useState } from 'react';
import { useAtom } from 'jotai';
import { PinedMessagesAtom } from '@Atoms/ChatMessageEvents';
import { Conversation } from '@Models/chatmessage';
import { Hidemessage } from '@Types/types';
import { socketManager } from "@/utils/socket/SocketManager";

/**
 * Custom hook for handling pinned messages in a chat room
 * 
 * @param roomId - The ID of the chat room
 * @param currentUserUtility - Current user's utility information
 * @param conversation - The conversation array
 * @returns Pinned messages and related functions
 */
export const usePinnedMessages = (
    roomId: string,
    currentUserUtility: any,
) => {
    const [pinnedMessages, setPinnedMessages] = useAtom(PinedMessagesAtom);
    const [isLoading, setIsLoading] = useState(false);

    // Get pinned messages using socket API
    const getPinnedMessages = useCallback(() => {
        return new Promise<any[]>((resolve) => {
            if (!roomId || !currentUserUtility?.user_id) {
                resolve([]);
                return;
            }

            setIsLoading(true);

            // Use the socket-based getPinChats with a callback
            const unsubscribe = socketManager.conversation.getPinChats(roomId, (pinnedData) => {
                setIsLoading(false);

                // Filter results to only include pins by the current user
                const filteredData = pinnedData ?? [];

                resolve(filteredData);
            });

            // Return a cleanup function if needed
            return () => {
                unsubscribe();
            };
        });
    }, [roomId, currentUserUtility?.user_id]);

    // Fetch pinned messages when roomId changes
    useEffect(() => {
        if (roomId && currentUserUtility?.user_id) {
            getPinnedMessages().then(setPinnedMessages);
        }

        return () => {
            setPinnedMessages([]); // Clear pinned messages on cleanup
        };
    }, [roomId, currentUserUtility?.user_id, getPinnedMessages, setPinnedMessages]);



    // Refresh pinned messages
    const refreshPinnedMessages = useCallback(() => {
        getPinnedMessages().then(setPinnedMessages);
    }, [getPinnedMessages, setPinnedMessages]);

    return {
        pinnedMessages,
        setPinnedMessages,
        refreshPinnedMessages,
        getPinnedMessages,
        isLoading
    };
};