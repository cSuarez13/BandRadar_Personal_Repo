import { Stack } from 'expo-router';
import { Image, Pressable, View } from 'react-native';
import { useSession } from '~/context/ctx';
import { Ionicons } from '@expo/vector-icons';

export const unstable_settings = {
  initialRouteName: '(root)',
};

export default function AppLayout() {
  const { session, signOut } = useSession();

  return (
    <Stack
      screenOptions={{
        title: 'Home',
        headerLeft: () => (
          <View>
            <Image
              source={{ uri: session?.user.images[0].url }}
              style={{ width: 30, height: 30, borderRadius: 999 }}
            />
          </View>
        ),
        headerRight: () => (
          <Pressable onPress={() => signOut()}>
            <Ionicons name="log-out-outline" size={24} color="black" />
          </Pressable>
        ),
      }}>
      <Stack.Screen name="(root)" />
      <Stack.Screen
        name="sign-in"
        options={{
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
