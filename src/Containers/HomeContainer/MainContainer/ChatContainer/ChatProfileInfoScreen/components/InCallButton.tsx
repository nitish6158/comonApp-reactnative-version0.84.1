import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { callFullScreenState, callMiniScreenState } from '@Atoms/callAtom';
import Colors from '@/Constants/Colors';

const InCallButton = () => {
    const { t } = useTranslation();
    const [, toggleFullScreenMode] = useAtom(callFullScreenState);
    const [, toggleMiniScreenMode] = useAtom(callMiniScreenState);

    const handlePress = () => {
        toggleFullScreenMode(true);
        toggleMiniScreenMode(false);
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            style={styles.container}
        >
            <Text style={styles.text}>{t('calls.in-call')}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.light.PrimaryColor,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: 'white',
        fontFamily: 'Lato',
        fontSize: 14,
    },
});

export default InCallButton;