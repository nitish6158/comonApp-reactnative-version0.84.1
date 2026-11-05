import { useMemo } from 'react';

interface UseRoomPermissionsProps {
    roomType: string;
    roomPermissions?: {
        EditInfoPermission: { permit: string; type: string };
        PinPermission: { permit: string; type: string };
        SendMessagePermission: { permit: string; type: string };
    };
    currentUserRole: string;
    hasLeftRoom: boolean;
    participantCount?: number;
}

/**
 * Custom hook to manage room permissions and access control
 */
export default function useRoomPermissions({
    roomType,
    roomPermissions,
    currentUserRole,
    hasLeftRoom,
    participantCount = 0
}: UseRoomPermissionsProps) {

    // Check if the current user can edit group info
    const canEditGroupInfo = useMemo(() => {
        // Users who left the room can't edit anything
        if (hasLeftRoom || roomType === "self") {
            return false;
        }

        // Admin permission check
        if (
            roomPermissions?.EditInfoPermission.permit === "admin" &&
            currentUserRole === "admin"
        ) {
            return true;
        }

        // Common user permission check when permission is set to "common"
        if (
            (roomPermissions?.EditInfoPermission.permit === "common" &&
                currentUserRole === "common") ||
            currentUserRole === "admin"
        ) {
            return true;
        }

        return false;
    }, [roomType, hasLeftRoom, roomPermissions, currentUserRole]);

    // Check if audio/video buttons should be hidden
    const shouldHideAudioVideo = useMemo(() => {
        if (roomType === "broadcast") {
            return true;
        }

        if (roomType === "individual") {
            // In blocked individual chats, hide buttons unless it's your own chat
            return hasLeftRoom;
        }

        if (roomType === "self") {
            return true;
        }

        if (roomType === "group") {
            // Hide if there's only one participant left in the group
            return participantCount <= 1;
        }

        return false;
    }, [roomType, hasLeftRoom, participantCount]);

    // Can send message check
    const canSendMessage = useMemo(() => {
        if (hasLeftRoom || roomType === "broadcast") {
            return false;
        }

        if (roomType === "group") {
            if (roomPermissions?.SendMessagePermission.permit === "admin" && currentUserRole !== "admin") {
                return false;
            }
        }

        return true;
    }, [roomType, hasLeftRoom, roomPermissions, currentUserRole]);

    // Can pin message check
    const canPinMessage = useMemo(() => {
        if (hasLeftRoom) {
            return false;
        }

        if (roomPermissions?.PinPermission.permit === "admin" && currentUserRole !== "admin") {
            return false;
        }

        return true;
    }, [hasLeftRoom, roomPermissions, currentUserRole]);

    return {
        canEditGroupInfo,
        shouldHideAudioVideo,
        canSendMessage,
        canPinMessage
    };
}