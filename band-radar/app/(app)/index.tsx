import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import LocationPicker from '~/components/LocationPicker';

import { useSession } from '~/context/ctx';
import { TicketmasterEventResponse } from '~/types';
import { getEvents } from '~/utils/events';

export default function Index() {
  const { signOut, session, isCompilingGenres, genres, location } = useSession();

  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [events, setEvents] = useState<TicketmasterEventResponse | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (genres && location) {
        try {
          setIsLoadingEvents(true);
          const events = await getEvents({
            classificationName: 'music',
            startDateTime: '2025-06-26T00:00:00Z',
            endDateTime: '2025-07-27T23:59:59Z',
            latlong: [location.lat, location.lng],
            radius: 20,
            unit: 'km',
            genreId: genres.map((genre) => genre.id),
          });
          console.log(events);

          setEvents(events);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoadingEvents(false);
        }
      }
    };

    fetchEvents();
  }, [genres, location]);

  if (isCompilingGenres) {
    return <Text>Compiling genres...</Text>;
  }

  if (isLoadingEvents) {
    return <Text>Loading events...</Text>;
  }

  return (
    <ScrollView>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text
          onPress={() => {
            // The `app/(app)/_layout.tsx` will redirect to the sign-in screen.
            signOut();
          }}>
          Sign Out
        </Text>

        <Text>
          {JSON.stringify(
            events?._embedded.events.map((a) => a.name),
            null,
            2
          )}
        </Text>

        <LocationPicker />

        <Text>{JSON.stringify(session, null, 2)}</Text>
      </View>
    </ScrollView>
  );
}
