import { useEffect, useCallback, useState } from 'react';
import { atom, useAtom } from 'jotai';
import { socketManager } from "@/utils/socket/SocketManager";

// Create atoms for favourite messages state
export const favouriteMessagesAtom = atom<any[]>([]);
export const favouriteMessagesPaginationAtom = atom({
    page: 1,
    totalPages: 1,
    hasMore: true,
    isLoadingMore: false,
    messagesPerPage: 20
});

/**
 * Custom hook for handling favourite messages in a chat room with pagination
 * 
 * @param roomId - The ID of the chat room
 * @param currentUserUtility - Current user's utility information
 * @returns Favourite messages and related functions
 */
export const useFavouriteMessages = (
    roomId: string,
    currentUserUtility: any,
) => {
    const [favouriteMessages, setFavouriteMessages] = useAtom(favouriteMessagesAtom);
    const [pagination, setPagination] = useAtom(favouriteMessagesPaginationAtom);
    const [isLoading, setIsLoading] = useState(false);

    // Get favourite messages using socket API with pagination
    const getFavouriteMessages = useCallback((page = 1, append = false) => {
        return new Promise<{ messages: any[], totalPages: number }>((resolve) => {
            if (!roomId || !currentUserUtility?.user_id) {
                resolve({ messages: [], totalPages: 0 });
                return;
            }

            const skip = (page - 1) * pagination.messagesPerPage;
            const limit = pagination.messagesPerPage;

            setIsLoading(true);
            setPagination(prev => ({ ...prev, isLoadingMore: append }));

            // Use the socket-based getFavouriteChats with a callback and pagination
            socketManager.conversation.getFavouriteChats(roomId, (response) => {
                setIsLoading(false);
                setPagination(prev => ({
                    ...prev,
                    isLoadingMore: false,
                    page: page,
                    totalPages: response.totalPages || 1,
                    hasMore: page < (response.totalPages || 1)
                }));

                // Process the response which now includes messages and totalPages
                const messages = response.messages || [];
                resolve({ messages, totalPages: response.totalPages || 1 });
            }, skip, limit);
        });
    }, [roomId, currentUserUtility?.user_id, pagination.messagesPerPage, setPagination]);

    // Fetch initial favourite messages when roomId changes
    useEffect(() => {
        if (roomId && currentUserUtility?.user_id) {
            // Reset pagination when room changes
            setPagination({
                page: 1,
                totalPages: 1,
                hasMore: true,
                isLoadingMore: false,
                messagesPerPage: 20
            });

            // Fetch first page
            getFavouriteMessages(1).then(({ messages }) => {
                setFavouriteMessages(messages);
            });
        }

        return () => {
            setFavouriteMessages([]); // Clear favourite messages on cleanup
        };
    }, [roomId, currentUserUtility?.user_id, getFavouriteMessages, setFavouriteMessages, setPagination]);

    // Load more messages function
    const loadMoreFavouriteMessages = useCallback(async () => {
        // Check if there are more pages to load and we're not already loading
        if (!pagination.hasMore || pagination.isLoadingMore) {
            return;
        }

        const nextPage = pagination.page + 1;
        const { messages } = await getFavouriteMessages(nextPage, true);

        // Append new messages to existing ones
        setFavouriteMessages(prev => [...prev, ...messages]);

    }, [getFavouriteMessages, pagination.hasMore, pagination.isLoadingMore, pagination.page, setFavouriteMessages]);

    // Refresh favourite messages (reload first page)
    const refreshFavouriteMessages = useCallback(() => {
        getFavouriteMessages(1).then(({ messages }) => {
            setFavouriteMessages(messages);
        });
    }, [getFavouriteMessages, setFavouriteMessages]);

    return {
        favouriteMessages,
        refreshFavouriteMessages,
        loadMoreFavouriteMessages,
        isLoading,
        pagination
    };
};