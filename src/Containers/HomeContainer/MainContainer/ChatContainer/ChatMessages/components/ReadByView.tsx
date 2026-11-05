import React, { memo, useMemo } from 'react';
import { View } from 'react-native';
import AvtaarWithoutTitle from '@Components/AvtaarWithoutTitle';
import { DefaultImageUrl } from '@Service/provider/endpoints';
import {produce} from 'immer';

interface ReadByViewProps {
    readByData: {
        read_by: Array<{ user_id: string; read_at: number }>;
    };
    participants: any[];
    roomType: string;
}

/**
 * Component for displaying message read receipts
 */
const ReadByView: React.FC<ReadByViewProps> = ({ readByData, participants, roomType }) => {
    // Use immer to efficiently map read_by data to profile images
    const readByProfiles = useMemo(() => {
        return produce(readByData.read_by, (draftReadBy) => {
            return draftReadBy
                .map((user) => {
                    // Find participant who read the message
                    const found = participants.filter(
                        (dp) => dp.user_id === user.user_id
                    );
                    if (found.length > 0) {
                        return found[0].profile_img;
                    }
                    return undefined;
                })
                .filter(Boolean); // Remove undefined entries
        });
    }, [readByData.read_by, participants]);

    // Limit the number of avatars shown based on room type
    const visibleProfiles = useMemo(() => {
        const maxVisible = roomType === "group" ? 3 : 1;
        return readByProfiles.slice(0, maxVisible);
    }, [readByProfiles, roomType]);

    return (
        <>
            {visibleProfiles.map((image, index) => (
                <View key={index}>
                    <AvtaarWithoutTitle
                        ImageSource={{ uri: `${DefaultImageUrl}${image}` }}
                        AvatarContainerStyle={{
                            height: 15,
                            width: 15,
                            marginLeft: 5,
                            marginBottom: 10,
                            bottom: 0,
                        }}
                    />
                </View>
            ))}
        </>
    );
};

export default memo(ReadByView);