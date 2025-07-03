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
  const { isCompilingGenres, genres, location, startDate, endDate, setStartDate, setEndDate } =
    useSession();

  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [events, setEvents] = useState<TicketmasterEventResponse | null>(null);

  // Parse stored date strings or apply defaults on first load
  useEffect(() => {
    let parsedStart = startDate;
    let parsedEnd = endDate;

    if (typeof startDate === 'string') {
      const parsed = new Date(startDate);
      if (!isNaN(parsed.getTime())) parsedStart = parsed;
    }

    if (typeof endDate === 'string') {
      const parsed = new Date(endDate);
      if (!isNaN(parsed.getTime())) parsedEnd = parsed;
    }

    if (!parsedStart) {
      parsedStart = new Date();
    }

    if (!parsedEnd) {
      parsedEnd = new Date();
      parsedEnd.setDate(parsedEnd.getDate() + 7);
    }

    if (parsedStart !== startDate) setStartDate(parsedStart);
    if (parsedEnd !== endDate) setEndDate(parsedEnd);
  }, []);

  // Fetch events when filters change
  useEffect(() => {
    const fetchEvents = async () => {
      if (!startDate || !endDate) return;
      if (genres && location) {
        const startDateTime =
          new Date(startDate.setHours(0, 0, 0, 0)).toISOString().split('.')[0] + 'Z';
        const endDateTime =
          new Date(endDate.setHours(23, 59, 59, 999)).toISOString().split('.')[0] + 'Z';

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
  }, [genres, location, startDate, endDate]);

  if (isCompilingGenres) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Compiling genres...</Text>
      </View>
    );
  }

  if (isLoadingEvents || !startDate || !endDate) {
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
        {/* LocationPicker now handles displaying the selected location */}
        <LocationPicker />

        <FlatList
          data={events?._embedded?.events || []}
          keyExtractor={(item) => item.id}
          style={styles.flatList}
          ListHeaderComponent={() => (
            <View style={styles.headerContainer}>
              {/* Simplified header with only date pickers */}
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 20,
                  marginBottom: 20,
                  gap: 20,
                  paddingHorizontal: 16,
                }}>
                {/* Start Date */}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', marginBottom: 4 }}>Start Date</Text>
                  {Platform.OS === 'ios' ? (
                    <DateTimePicker
                      themeVariant="dark"
                      value={new Date(startDate)}
                      mode="date"
                      display="default"
                      onChange={(event, date) => {
                        if (date) setStartDate(date);
                      }}
                    />
                  ) : (
                    <>
                      <Pressable onPress={() => setShowDatePicker('start')}>
                        <Text style={{ color: 'white', fontSize: 16 }}>
                          📅 {startDate.toLocaleDateString()}
                        </Text>
                      </Pressable>
                      {showDatePicker === 'start' && (
                        <DateTimePicker
                          value={new Date(startDate)}
                          mode="date"
                          onChange={(event, date) => {
                            if (date) setStartDate(date);
                            setShowDatePicker(null);
                          }}
                        />
                      )}
                    </>
                  )}
                </View>

                {/* End Date */}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', marginBottom: 4 }}>End Date</Text>
                  {Platform.OS === 'ios' ? (
                    <DateTimePicker
                      themeVariant="dark"
                      value={new Date(endDate)}
                      mode="date"
                      display="default"
                      onChange={(event, date) => {
                        if (date) setEndDate(date);
                      }}
                    />
                  ) : (
                    <>
                      <Pressable onPress={() => setShowDatePicker('end')}>
                        <Text style={{ color: 'white', fontSize: 16 }}>
                          📅 {endDate.toLocaleDateString()}
                        </Text>
                      </Pressable>
                      {showDatePicker === 'end' && (
                        <DateTimePicker
                          value={new Date(endDate)}
                          mode="date"
                          onChange={(event, date) => {
                            if (date) setEndDate(date);
                            setShowDatePicker(null);
                          }}
                        />
                      )}
                    </>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
    height: 48, // Fixed height for both containers
  },
  dateRangeWrapper: {
    flex: 1,
    height: 48, // Same height as location
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    height: 48, // Same height as date range
    justifyContent: 'center',
  },
  locationText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 8, // Reduced padding for better fit
    height: 48, // Fixed height
    flex: 1,
  },
  datePickerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  dateButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dateLabel: {
    color: '#999',
    fontSize: 12,
    marginBottom: 4,
  },
  dateText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  arrowContainer: {
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
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
