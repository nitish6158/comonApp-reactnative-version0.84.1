import React, { memo, useMemo } from 'react';
import { View } from 'react-native';
import moment from 'moment-timezone';
import DividingDateChat from '@Components/DividingDateChat';
import SystemMessage from '../SystemMessages';
import ChatMessage from './ChatMessage';
import { SingleUserAction, DoubleUserAction } from '@Types/types';

interface MessageItemProps {
    item: any;
    index: number;
    conversation: any[];
    myProfileMode: string;
    organisationInvites: any[];
}

/**
 * Component for rendering a message item in the chat list
 */
const MessageItem: React.FC<MessageItemProps> = ({
    item,
    index,
    conversation,
    myProfileMode,
    organisationInvites
}) => {
    // Determine if this message marks the last message of a day
    const isLastMessageOfDay = useMemo(() => {
        const nextItem = conversation[index + 1];
        if (!nextItem) return true;

        const timestamp = moment(item.created_at).format('DD.MM.YYYY');
        const nextTimestamp = moment(nextItem.created_at).format('DD.MM.YYYY');

        return timestamp !== nextTimestamp;
    }, [item.created_at, conversation, index]);

    const timestamp = moment(item.created_at).format('DD.MM.YYYY');

    // For system action messages
    if (SingleUserAction[item?.type] || DoubleUserAction[item?.type]) {
        if (myProfileMode === "SENIORCITIZEN") {
            return null;
        }

        return (
            <View key={`${item._id}${index}`}>
                {isLastMessageOfDay && <DividingDateChat Time={timestamp} />}
                <SystemMessage
                    type={SingleUserAction[item?.type] ? "SINGLE_ACTION" : "DOUBLE_ACTION"}
                    message={item}
                    OrganisationInvites={organisationInvites}
                />
            </View>
        );
    }

    // For regular chat messages
    return (
        <View key={`${item._id}${index}`}>
            {isLastMessageOfDay && <DividingDateChat Time={timestamp} />}
            <ChatMessage item={item} index={index} />
        </View>
    );
};

export default memo(MessageItem);