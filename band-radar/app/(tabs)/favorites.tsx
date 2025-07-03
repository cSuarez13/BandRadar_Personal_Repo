import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import EventItem from '~/components/EventItem';
import { useSession } from '~/context/ctx';
import { Event } from '~/types';
import { getEvent } from '~/utils/event';

export default function Favorites() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const { favoriteIds } = useSession();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!favoriteIds || favoriteIds.length === 0) {
        setEvents([]);
        return;
      }
      setLoading(true);
      try {
        // Fetch each favorite event by ID
        const results = await Promise.all(favoriteIds.map((id) => getEvent(id)));
        setEvents(results.filter((result): result is Event => result !== null));
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [favoriteIds]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#121212',
        }}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={{ color: 'white', marginTop: 10 }}>Loading favorites...</Text>
      </View>
    );
  }

  if (!events.length) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#121212',
        }}>
        <Text style={{ color: 'white' }}>No favorite concerts yet.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#121212', paddingHorizontal: 16 }}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventItem item={item} />}
        contentContainerStyle={{ paddingVertical: 32 }}
      />
    </View>
  );
}
