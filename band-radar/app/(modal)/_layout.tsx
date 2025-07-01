import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useSession } from '~/context/ctx';

export default function ModalLayout() {
  const { toggleFavorite, favoriteIds } = useSession();
  return (
    <Stack
      screenOptions={{
        title: 'Event',
      }}>
      <Stack.Screen
        name="[id]"
        options={({ route }) => ({
          presentation: 'modal',
          headerStyle: { backgroundColor: '#00ff41' },
          title: 'Event',
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </Pressable>
          ),
          headerRight: () => {
            const { id } = route.params as { id: string };
            return (
              <Pressable onPress={() => toggleFavorite(id)}>
                {favoriteIds && favoriteIds.includes(id) ? (
                  <Ionicons name="star" size={24} color="#ef9b0d" />
                ) : (
                  <Ionicons name="star-outline" size={24} color="black" />
                )}
              </Pressable>
            );
          },
        })}
      />
    </Stack>
  );
}
