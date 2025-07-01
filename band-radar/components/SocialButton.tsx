import {TouchableOpacity, StyleSheet, Linking, TouchableOpacityProps} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface PlateformUrl {
    platform: string,
    url: string,
}

export type PlateformType = 'youtube-play' | 'twitter' |'instagram' | 'facebook' | 'globe'| 'link' | "wikipedia";


export function SocialButton({ platform, url } : PlateformUrl):any{
    let iconName:PlateformType, color;
    // Determine the icon and color based on the platform name
    switch (platform.toLowerCase()) {
        case 'youtube':
            iconName = 'youtube-play';
            color = '#FF0000';
            break;
        case 'twitter':
            iconName = 'twitter';
            color = '#1DA1F1';
            break;
        case 'instagram':
            iconName = 'instagram';
            color = '#C13584'; // Instagram's Pink
            break;
        case 'facebook':
            iconName = 'facebook';
            color = '#4267B2';
            break;
        case 'homepage':
        case 'website':
            iconName = 'globe';
            color = '#888';
            break;
        default:
            // A fallback for any other link type
            iconName = 'link';
            color = '#888';
    }

    if (!url) return null;

    return (
        <TouchableOpacity
            onPress={() => Linking.openURL(url)}
            style={[styles.socialButton, { backgroundColor: color }]}
        >
            <FontAwesome name={iconName} size={22} color="white" />
        </TouchableOpacity>
    );
};


const styles = StyleSheet.create({
    socialButton: {
        width: 44,
        height: 44,
        borderRadius: 22, // Makes it a circle
        justifyContent: 'center',
        alignItems: 'center',
    },
});