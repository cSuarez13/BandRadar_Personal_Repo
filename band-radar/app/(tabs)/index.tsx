import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';

import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import LocationPicker from '~/components/LocationPicker';

import EventItem from '~/components/EventItem';
import { useSession } from '~/context/ctx';
import { TicketmasterEventResponse } from '~/types';
import { getEvents } from '~/utils/events';

export default function Home() {
  const { isCompilingGenres, genres, location } = useSession();

  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [events, setEvents] = useState<TicketmasterEventResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchEvents = async () => {
      if (genres && location) {
        const startDateTime =
          new Date(selectedDate.setHours(0, 0, 0, 0)).toISOString().split('.')[0] + 'Z';
        const endDateTime =
          new Date(selectedDate.setHours(23, 59, 59, 999)).toISOString().split('.')[0] + 'Z';

        console.log(startDateTime, endDateTime);

        try {
          setIsLoadingEvents(true);
          const events = await getEvents({
            classificationName: 'music',
            startDateTime,
            endDateTime,
            latlong: [location.lat, location.lng],
            radius: 20,
            unit: 'km',
            genreId: genres.map((genre) => genre.id),
          });
          setEvents(events);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoadingEvents(false);
        }
      }
    };

    fetchEvents();
  }, [genres, location, selectedDate]);

  // Show loading indicators for genres or events
  if (isCompilingGenres) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#000',
        }}>
        <Text style={{ color: 'white' }}>Compiling genres...</Text>
      </View>
    );
  }

  if (isLoadingEvents) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#000',
        }}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={{ color: 'white', marginTop: 10 }}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#111111' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        {/* Dynamic Date and Location Buttons */}
        <LocationPicker />

        <FlatList
          data={events?._embedded?.events || []}
          keyExtractor={(item) => item.id}
          style={{ width: '100%', flex: 1 }}
          ListHeaderComponent={() => (
            <>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 20,
                  marginBottom: 20,
                }}>
                <View
                  style={{
                    backgroundColor: '#2a2a2a',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    width: 'auto',
                  }}>
                  <Text style={{ color: 'white', fontSize: 16 }}>
                    📍 {`${location?.placeName}`}
                  </Text>
                </View>

                <DateTimePicker
                  themeVariant="dark"
                  value={selectedDate}
                  mode="date"
                  display="default"
                  design="material"
                  onChange={(event, date) => {
                    if (date) setSelectedDate(date);
                  }}
                />
              </View>

              {/* Recommended Concerts Header */}
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 16 }}>
                Recommended Concerts
              </Text>
            </>
          )}
          renderItem={({ item }) => <EventItem item={item} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
        />
      </View>
    </View>
  );
}
