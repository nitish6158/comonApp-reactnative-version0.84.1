import React, { useMemo } from 'react';
import { Pressable, Alert, View } from 'react-native';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { callAtom } from '@Atoms/callAtom';
import { checkCallPermissions } from '@Util/permission';
import Call from '@Images/Profile/call.svg';
import VideoCall from '@Images/Profile/VideoCall.svg';
import InCallButton from './InCallButton';
import JoinCallButton from './JoinCallButton';
import ToastMessage from '@Util/ToastMesage';

type CallActionsProps = {
    display: any;
    internet: boolean;
    groupCallsData: any;
    hideAudioAndVideo: boolean;
    toggleFullScreenMode: (value: boolean) => void;
    toggleMiniScreenMode: (value: boolean) => void;
};

export const CallActions = React.memo(({
    display,
    internet,
    groupCallsData,
    hideAudioAndVideo,
    toggleFullScreenMode,
    toggleMiniScreenMode,
}: CallActionsProps) => {
    const [callRequest, setCallRequest] = useAtom(callAtom);
    const { t } = useTranslation();

    // Join existing call handler
    const onPressJoinCall = async () => {
        const res = await checkCallPermissions(groupCallsData?.type === "audio" ? "audio" : "video");
        if (res === true) {
            if (callRequest == null) {
                const partipantsData = groupCallsData?.callParticipants.map((e) => {
                    if (e.userId._id) {
                        return {
                            ...e.userId,
                            userId: e.userId._id,
                            uid: e.uid,
                        };
                    }
                    return e;
                });
                setCallRequest({
                    roomId: display.roomId,
                    roomName: display.roomName,
                    isReceiver: true,
                    callId: groupCallsData?._id,
                    channelId: groupCallsData?.channelName,
                    channelName: groupCallsData?.channelName,
                    callType: groupCallsData?.type,
                    roomType: groupCallsData?.roomType,
                    participants: partipantsData,
                    callBackground: display.roomWallpaper.url,
                });
            } else {
                if (callRequest.roomId === groupCallsData?.roomId?._id) {
                    toggleFullScreenMode(true);
                    toggleMiniScreenMode(false);
                } else {
                    ToastMessage(`${t("toastmessage.already-incall-canjoin")}`);
                }
            }
        }
    };

    // Initialize audio call
    const handleAudioCall = async () => {
        const res = await checkCallPermissions("audio");
        if (res === true) {
            if (internet) {
                if (callRequest == null) {
                    setCallRequest({
                        callType: "audio",
                        roomType: display.roomType,
                        roomId: display.roomId,
                        callBackground: display.roomImage,
                        roomName: display.roomName,
                        participants: [],
                        isReceiver: false,
                    });
                } else {
                    ToastMessage(`${t("toastmessage.incall-already-message")}`);
                }
            } else {
                Alert.alert(
                    "",
                    t(
                        "others.Couldn't place call. Make sure your device have an internet connection and try again"
                    )
                );
            }
        }
    };

    // Initialize video call
    const handleVideoCall = async () => {
        const res = await checkCallPermissions("video");
        if (res === true) {
            if (internet) {
                if (callRequest == null) {
                    setCallRequest({
                        callType: "video",
                        roomType: display.roomType,
                        roomId: display.roomId,
                        callBackground: display.roomImage,
                        roomName: display.roomName,
                        participants: [],
                        isReceiver: false,
                    });
                } else {
                    ToastMessage(`${t("toastmessage.incall-already-message")}`);
                }
            } else {
                Alert.alert(
                    "",
                    t(
                        "others.Couldn't place call. Make sure your device have an internet connection and try again"
                    )
                );
            }
        }
    };

    // Render existing group call controls or individual call controls
    if (groupCallsData != null) {
        return (
            <View style={{ paddingHorizontal: 10 }}>
                {callRequest?.roomId === groupCallsData.roomId ? (
                    <InCallButton />
                ) : (
                    <JoinCallButton onPress={onPressJoinCall} />
                )}
            </View>
        );
    }

    if (!hideAudioAndVideo) {
        return (
            <>
                <Pressable onPress={handleAudioCall}>
                    <Call style={{ marginHorizontal: 15 }} />
                </Pressable>
                <Pressable onPress={handleVideoCall}>
                    <VideoCall />
                </Pressable>
            </>
        );
    }

    return null;
});

export default CallActions;