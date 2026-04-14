import React, { memo, useCallback, useContext, useEffect, useState } from 'react';
import { FlatList, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAtomValue } from 'jotai';

import PinChat from '../PinChat';
import { usePinnedMessages } from '@/hooks/conversations/usePinnedMessages';
import { chatSearchEnabledAtom } from '@/Atoms/ChatMessageEvents';
import { singleRoom } from '@/Atoms';
import { ChatContext } from '@/Context/ChatProvider';

interface PinnedChatsSectionProps {
    roomId: string;
}


const PinnedChatsSection: React.FC<PinnedChatsSectionProps> = ({
    roomId
}) => {
    const navigation = useNavigation();
    const searchEnabled = useAtomValue(chatSearchEnabledAtom);
    const display = useAtomValue(singleRoom);

    const { pinnedMessages, isLoading, refreshPinnedMessages } = usePinnedMessages(
        roomId,
        display?.currentUserUtility,
    );

    useEffect(() => {
        refreshPinnedMessages
    },[refreshPinnedMessages])

    const handleUnpin = useCallback((messageId: string) => {
        setTimeout(() => {
            refreshPinnedMessages();
        }, 500);
    }, [refreshPinnedMessages]);

    if (searchEnabled) {
        return null;
    }

    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="small" color="#33CCFF" />
            </View>
        );
    }

    // If no pinned messages, don't render anything
    if (!pinnedMessages || pinnedMessages.length === 0) {
        return null;
    }

    // Render each pinned message
    const renderPinnedMessage = ({ item }) => (
        <PinChat
            key={item._id}
            navigation={navigation}
            ChatData={item}
            conversationMessageIndex={0}
            message={item.message}
            Cid={item._id}
            activeRoomid={roomId}
            Item={item}
            onUnpin={handleUnpin} // Pass the unpin handler
        />
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={pinnedMessages}
                keyExtractor={(item) => item._id || item.created_at?.toString()}
                renderItem={renderPinnedMessage}
                removeClippedSubviews={true}
                scrollEnabled={pinnedMessages.length > 2}
                horizontal={false}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        maxHeight: 200, // Limit height to prevent taking up too much screen space
        marginBottom: 5,
    },
    loadingContainer: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default memo(PinnedChatsSection);