import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import AvtaarWithoutTitle from '@Components/AvtaarWithoutTitle';
import { DefaultImageUrl } from '@Service/provider/endpoints';

interface SenderAvatarProps {
    isVisible: boolean;
    url: string;
    senderId: string | null;
    createRoom: any; // The create room mutation
    navigation: any;
}

/**
 * Component for displaying the sender's avatar with interaction capability
 */
const SenderAvatar: React.FC<SenderAvatarProps> = ({
    isVisible,
    url,
    senderId,
    createRoom,
    navigation
}) => {
    // Don't render if not visible
    if (!isVisible) {
        return null;
    }

    // Handle avatar press to navigate to the sender's chat
    const handlePress = useCallback(() => {
        if (!senderId) return;

        createRoom({
            variables: {
                input: {
                    type: "individual",
                    users: [senderId],
                    localId: "0",
                    profile_img: null,
                    name: "",
                },
            },
        })
            .then((res) => {
                if (res.data?.createRoom.success) {
                    navigation.navigate("ChatMessageScreen", {
                        RoomId: res.data.createRoom.roomId,
                    });
                }
            })
            .catch((error) => {
                console.error("Error creating room:", error);
            });
    }, [senderId, createRoom, navigation]);

    return (
        <Pressable
            onPress={handlePress}
            style={styles.container}
        >
            <AvtaarWithoutTitle
                ImageSource={{ uri: `${DefaultImageUrl}${url}` }}
                AvatarContainerStyle={styles.avatar}
            />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        marginTop: 10,
    },
    avatar: {
        height: 32,
        width: 32,
        marginLeft: 5,
    }
});

export default memo(SenderAvatar);