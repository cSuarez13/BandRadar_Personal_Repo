import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import LocationPicker from '~/components/LocationPicker';

import { useSession } from '~/context/ctx';
import { TicketmasterEventResponse } from '~/types';
import { getEvents } from '~/utils/events';

// Show recommended concerts based on Spotify genres
export default function Index() {
  const { signOut, isCompilingGenres, genres, location } = useSession();

  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [events, setEvents] = useState<TicketmasterEventResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Fetch events when genres, location, or selectedDate changes
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white' }}>Compiling genres...</Text>
      </View>
    );
  }

  if (isLoadingEvents) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={{ color: 'white', marginTop: 10 }}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
      {/* Header area with Sign Out button */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {/* Dynamic Date and Location Buttons */}

        {/* List of Recommended Concerts using FlatList */}
        <FlatList
          data={events?._embedded?.events || []}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => (
            <>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 20,
                  marginBottom: 20,
                  paddingHorizontal: 16,
                }}>
                {/* 📍 Location Display Box */}
                <View
                  style={{
                    backgroundColor: '#2a2a2a',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 12,
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
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'grey', marginBottom: 16 }}>
                Recommended Concerts
              </Text>
            </>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => console.log('Clicked:', item.name)}
              style={{
                backgroundColor: '#696464',
                borderRadius: 12,
                marginBottom: 16,
                width: 320,
                overflow: 'hidden',
              }}>
              {/* Concert image */}
              {item.images?.[0]?.url && (
                <Image
                  source={{ uri: item.images[0].url }}
                  style={{ width: '100%', height: 160 }}
                  resizeMode="cover"
                />
              )}

              {/* Concert name and details */}
              <View style={{ padding: 12 }}>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                  {item.name}
                </Text>
                <Text style={{ color: '#f0f0f0', marginTop: 4 }}>
                  📍 {item._embedded?.venues?.[0]?.name} | 🗓️ {item.dates?.start?.localDate}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ alignItems: 'center', paddingBottom: 80 }}
        />
      </View>
    </View>
  );
}
