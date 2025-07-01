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
  const [showPicker, setShowPicker] = useState(false);

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
                {/* 📍 Location Display Box */}
                <View
                  style={{
                    backgroundColor: '#2a2a2a',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    width: 'auto',
                  }}>
                  <Text style={{ color: 'white', fontSize: 16 }}>
                    📍 {`${location?.lat.toFixed(2)}, ${location?.lng.toFixed(2)}`}
                  </Text>
                </View>

                {/* 📅 Date Picker Box */}
                <Pressable
                  onPress={() => setShowPicker(true)}
                  style={{
                    backgroundColor: '#2a2a2a',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                  }}>
                  <Text style={{ color: 'white', fontSize: 16 }}>
                    📅 {selectedDate.toDateString()}
                  </Text>
                </Pressable>
              </View>

              {/* Show native date picker modal */}
              {showPicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowPicker(false);
                    if (date) setSelectedDate(date);
                  }}
                />
              )}

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
