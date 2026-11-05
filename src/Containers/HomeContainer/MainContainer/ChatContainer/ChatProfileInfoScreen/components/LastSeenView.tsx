import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '@Components/Text';
import Colors from '@/Constants/Colors';

type LastSeenViewProps = {
    roomType: string;
    participants: Array<any>;
    lastSeen: {
        time: string;
        status: string;
        isBlocked: boolean;
    };
};

const LastSeenView = React.memo(({
    roomType,
    participants,
    lastSeen
}: LastSeenViewProps) => {
    const { t } = useTranslation();

    if (roomType === "group") {
        return (
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 2,
                    maxWidth: "100%",
                    overflow: "hidden",
                }}
            >
                <Text style={{ fontSize: 12, color: "gray" }}>{`${participants.filter((dp) => dp.left_at === 0).length
                    } ${t("calls.participants")}`}</Text>
            </View>
        );
    }

    // Contact info screen requirement: hide online/offline status for individual chats.
    if (roomType === "individual" && !lastSeen.isBlocked) {
        return null;
    }

    if (roomType === "self") {
        return (
            <Text size="xs" style={{ color: Colors.light.Hiddengray, marginTop: 3 }}>
                {t("others.Message Yourself")}
            </Text>
        );
    }

    return null;
});

export default LastSeenView;
