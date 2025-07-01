import React from 'react';
import { TouchableOpacity, StyleSheet, Text, Linking, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

type VenueButtonProps = {
    url: string;
    label?: string;
};

export const VenueButton: React.FC<VenueButtonProps> = ({ url, label = 'Visit Venue Website' }) => (
    <TouchableOpacity style={styles.button} onPress={() => Linking.openURL(url)}>
        <View style={styles.content}>
            <FontAwesome name="map-marker" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.text}>{label}</Text>
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        backgroundColor: '#1e90ff',
        borderRadius: 22,
        paddingVertical: 10,
        paddingHorizontal: 18,
        alignSelf: 'center', // <-- Center the button horizontally
        marginVertical: 8,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 10,
    },
    text: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
