// app(tabs)/index.tsx
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import LocationPicker from '~/components/LocationPicker';
import EventItem from '~/components/EventItem';
import { useSession } from '~/context/ctx';
import { TicketmasterEventResponse } from '~/types';
import { getEvents } from '~/utils/events';

const NoResultsMessage = () => (
  <View style={styles.noResultsContainer}>
    <View style={styles.noResultsIconContainer}>
      <Ionicons name="musical-notes-outline" size={64} color="#666" />
    </View>
    <Text style={styles.noResultsTitle}>No concerts found</Text>
    <Text style={styles.noResultsSubtitle}>
      🎵😔 We couldn&apos;t find any concerts matching your preferences for your selected dates and
      location. Try adjusting your filters or exploring different dates to discover amazing shows
      near you!
    </Text>
    <View style={styles.suggestionContainer}>
      <Text style={styles.suggestionTitle}>Try:</Text>
      <Text style={styles.suggestionText}>• Expanding your date range</Text>
      <Text style={styles.suggestionText}>• Searching in a different location</Text>
      <Text style={styles.suggestionText}>• Checking back later for new events</Text>
    </View>
  </View>
);

export default function Home() {
  const {
    isCompilingGenres,
    genres,
    location,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    isLoadingDateRange,
  } = useSession();

  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [events, setEvents] = useState<TicketmasterEventResponse | null>(null);

  // Fetch events when filters change
  useEffect(() => {
    const fetchEvents = async () => {
      if (!startDate || !endDate || !genres || !location) return;

      // Create new Date objects to avoid mutating the original dates
      const startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0);

      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);

      const startISOString = startDateTime.toISOString().split('.')[0] + 'Z';
      const endISOString = endDateTime.toISOString().split('.')[0] + 'Z';

      console.log('Fetching events:', { startISOString, endISOString });

      try {
        setIsLoadingEvents(true);
        const events = await getEvents({
          classificationName: 'music',
          startDateTime: startISOString,
          endDateTime: endISOString,
          latlong: [location.lat, location.lng],
          radius: 20,
          unit: 'km',
          genreId: genres.map((genre) => genre.id),
        });
        setEvents(events);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [genres, location, startDate, endDate]);

  // Show loading while compiling genres or loading date range
  if (isCompilingGenres || isLoadingDateRange) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>
          {isCompilingGenres ? 'Compiling genres...' : 'Loading...'}
        </Text>
      </View>
    );
  }

  if (!startDate || !endDate) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }

  if (isLoadingEvents) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}>
        <LocationPicker />

        <FlatList
          data={events?._embedded?.events || []}
          keyExtractor={(item) => item.id}
          style={styles.flatList}
          ListHeaderComponent={() => (
            <View style={styles.headerContainer}>
              {/* Date pickers */}
              <View style={styles.datePickerContainer}>
                {/* Start Date */}
                <View style={styles.datePickerWrapper}>
                  <Text style={styles.dateLabel}>Start Date</Text>
                  {Platform.OS === 'ios' ? (
                    <View>
                      <DateTimePicker
                        themeVariant="dark"
                        value={startDate}
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                          if (date) setStartDate(date);
                        }}
                        style={{ width: '100%' }}
                      />
                    </View>
                  ) : (
                    <Pressable onPress={() => setShowDatePicker('start')}>
                      <Text style={styles.datePickerText}>📅 {startDate.toLocaleDateString()}</Text>
                    </Pressable>
                  )}
                  {showDatePicker === 'start' && Platform.OS !== 'ios' && (
                    <DateTimePicker
                      value={startDate}
                      mode="date"
                      onChange={(event, date) => {
                        if (date) setStartDate(date);
                        setShowDatePicker(null);
                      }}
                    />
                  )}
                </View>

                {/* End Date */}
                <View style={styles.datePickerWrapper}>
                  <Text style={styles.dateLabel}>End Date</Text>
                  {Platform.OS === 'ios' ? (
                    <View>
                      <DateTimePicker
                        themeVariant="dark"
                        value={endDate}
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                          if (date) setEndDate(date);
                        }}
                        style={{ width: '100%' }}
                      />
                    </View>
                  ) : (
                    <Pressable onPress={() => setShowDatePicker('end')}>
                      <Text style={styles.datePickerText}>📅 {endDate.toLocaleDateString()}</Text>
                    </Pressable>
                  )}
                  {showDatePicker === 'end' && Platform.OS !== 'ios' && (
                    <DateTimePicker
                      value={endDate}
                      mode="date"
                      onChange={(event, date) => {
                        if (date) setEndDate(date);
                        setShowDatePicker(null);
                      }}
                    />
                  )}
                </View>
              </View>

              <Text style={styles.headerTitle}>Recommended Concerts</Text>
            </View>
          )}
          ListEmptyComponent={() => <NoResultsMessage />}
          renderItem={({ item }) => <EventItem item={item} />}
          contentContainerStyle={styles.contentContainer}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111111',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
  },
  flatList: {
    width: '100%',
    flex: 1,
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  datePickerContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
    gap: 10,
    paddingHorizontal: 16,
  },
  datePickerWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  dateLabel: {
    color: 'white',
    marginBottom: 8,
    alignSelf: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  datePickerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  noResultsIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(102, 102, 102, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  noResultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  noResultsSubtitle: {
    fontSize: 16,
    color: '#999',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  suggestionContainer: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(0, 255, 65, 0.05)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 65, 0.2)',
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ff41',
    marginBottom: 12,
  },
  suggestionText: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 6,
    lineHeight: 20,
  },
});
