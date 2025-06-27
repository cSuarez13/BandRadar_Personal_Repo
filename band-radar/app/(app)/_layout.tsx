import { Stack, Link } from 'expo-router';
import { Image, Pressable, View, StyleSheet } from 'react-native';
import { useSession } from '~/context/ctx';
import { Ionicons } from '@expo/vector-icons';

const bandradar = require('~/assets/defaultIcon.png');

export const unstable_settings = {
  initialRouteName: '(root)',
};

export default function AppLayout() {
  const { session, signOut } = useSession();

  const imageUrl = session?.user.images?.[0]?.url ? { uri : session?.user.images?.[0]?.url} :bandradar;

  return (
    <Stack
      screenOptions={{
        title: 'Home',
        headerLeft: () => (
            <View style={styles.circle}>
                <Image
                    source={imageUrl}
                    style={styles.icon}
                    resizeMode="contain" // Ensures the whole image fits inside
                />
            </View>
        ),
        headerRight: () => (
          <Pressable onPress={() => signOut()}>
            <Ionicons name="log-out-outline" size={24} color="black" />
          </Pressable>
        ),
      }}>
        {/*<Stack.Screen name="(root)" />
        <Stack.Screen
         name="sign-in"
         options={{
          presentation: 'modal',
         }}
        />*/}
        <Stack.Screen
            name="index"
        />
        <Stack.Screen
            name="[id]"
            options={{
                presentation: 'modal',
            }}/>
    </Stack>
  );
}


const styles = StyleSheet.create({
    circle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#eee', // Optional: fallback background
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    icon: {
        width: 20, // Smaller than the circle
        height: 20,
        borderRadius: 5, // Optional: slight rounding for the square
    },
});