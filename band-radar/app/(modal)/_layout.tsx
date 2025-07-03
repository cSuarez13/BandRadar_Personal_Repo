import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Share, View } from 'react-native';
import { useSession } from '~/context/ctx';
import { useEffect, useState } from 'react';
import { getEvent } from '~/utils/event';
import { Event } from '~/types';

const ShareLink = async (link: string) => {
  const result = await Share.share({
    message: `Check this event I found on Band Radar\n\n${link}`,
  });
};

// Separate component for header right content
function HeaderRightContent({ id }: { id: string }) {
  const { toggleFavorite, favoriteIds } = useSession();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      if (!id) return;
      try {
        setLoading(true);
        const eventData = await getEvent(id);
        setEvent(eventData);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
      }}>
      <Pressable
        style={{ marginRight: 15 }}
        onPress={async () => {
          const eventUrl = event?.url || `https://www.ticketmaster.com/event/${id}`;
          await ShareLink(eventUrl);
        }}>
        <Ionicons name="share-outline" size={28} color="black" />
      </Pressable>
      <Pressable onPress={() => toggleFavorite(id)}>
        {favoriteIds && favoriteIds.includes(id) ? (
          <Ionicons name="star" size={28} color="#ef9b0d" />
        ) : (
          <Ionicons name="star-outline" size={28} color="black" />
        )}
      </Pressable>
    </View>
  );
}

export default function ModalLayout() {
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
          headerTitleAlign: 'center',
          title: 'Event',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <Ionicons name="arrow-back" size={28} color="black" />
            </Pressable>
          ),
          headerRight: () => {
            const { id } = route.params as { id: string };
            return <HeaderRightContent id={id} />;
          },
        })}
      />
    </Stack>
  );
}
