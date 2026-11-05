import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '@/Constants/Colors';

interface JoinCallButtonProps {
    onPress: () => void;
}

const JoinCallButton: React.FC<JoinCallButtonProps> = ({ onPress }) => {
    const { t } = useTranslation();

    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.container}
        >
            <Text style={styles.text}>{t('calls.join-call')}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.light.success,
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

export default JoinCallButton;