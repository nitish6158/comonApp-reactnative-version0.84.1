import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/core';
import getDownloadfileName from '@/utils/GetDownlodedFilename';
import { storage as chatMessageStorage } from "@/Context/ChatProvider";

interface UseRoomMediaProps {
    roomId: string;
    userId: string;
}

/**
 * Custom hook to manage room media count and conversation data
 */
export default function useRoomMedia({ roomId, userId }: UseRoomMediaProps) {
    const [mediaCount, setMediaCount] = useState(0);

    const getCachedMessages = useCallback((): any[] => {
        try {
            const raw = chatMessageStorage.getString(`conversations_${roomId}`);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Error reading cached room media:', error);
            return [];
        }
    }, [roomId]);

    useFocusEffect(
        useCallback(() => {
            if (!roomId || !userId) return;

            const fetchMediaData = async () => {
                try {
                    const conversations = getCachedMessages();

                    // Filter and count media
                    const myMedia = conversations.filter(
                        (conv) => !conv.deleted?.some((del) => del.user_id === userId)
                    );

                    let count = 0;
                    myMedia.forEach((element) => {
                        if (element.fileURL && getDownloadfileName(element.fileURL)) {
                            count += 1;
                        }
                    });

                    setMediaCount(count);
                } catch (error) {
                    console.error('Error fetching media data:', error);
                }
            };

            fetchMediaData();
        }, [getCachedMessages, roomId, userId])
    );

    return {
        mediaCount
    };
}
