// app/(tabs)/maps.tsx
import React, {useEffect, useState, useRef} from 'react';
import {View, ActivityIndicator, StyleSheet, Text, TouchableOpacity, Platform} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {Modalize} from 'react-native-modalize';
import {Ionicons} from '@expo/vector-icons';

import {getEvents} from '~/utils/events';
import {useSession} from '~/context/ctx';
import {TicketmasterEventResponse, Event} from '~/types';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

export default function ConcertMapPage() {
  const {isCompilingGenres, genres, location, startDate, endDate} = useSession();
  const [events, setEvents] = useState<TicketmasterEventResponse | null>(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const modalizeRef = useRef<Modalize | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!startDate || !endDate) return;
      if (genres && location) {
        const startDateTime =
          new Date(startDate.setHours(0, 0, 0, 0)).toISOString().split('.')[0] + 'Z';
        const endDateTime =
          new Date(endDate.setHours(23, 59, 59, 999)).toISOString().split('.')[0] + 'Z';

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

  const initialRegion = {
    latitude: location?.lat || 37.7749,
    longitude: location?.lng || -122.4194,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  const handleMarkerPress = (event: Event) => {
    setSelectedEvent(event);
    modalizeRef.current?.open();
  };

  const renderModalContent = () => {
    if (!selectedEvent) return null;
    const venue = selectedEvent._embedded?.venues?.[0];
    const concertName = selectedEvent.name;
    const venueName = venue?.name;
    const city = venue?.city?.name;
    const date = selectedEvent.dates?.start?.localDate;
    const time = selectedEvent.dates?.start?.localTime;

    return (
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{concertName}</Text>
        <Text style={styles.modalVenue}>
          {venueName}
          {city ? `, ${city}` : ''}
        </Text>
        <Text style={styles.modalDate}>
          {date}
          {time ? ` • ${time}` : ''}
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => modalizeRef.current?.close()}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const NoEventsOverlay = () => {
    if (isLoadingEvents || !events || events._embedded?.events.length > 0) return null;

    return (
      <View style={styles.noEventsOverlay}>
        <View style={styles.noEventsCard}>
          <Ionicons name="musical-notes-outline" size={48} color="#666"/>
          <Text style={styles.noEventsTitle}>No concerts found</Text>
          <Text style={styles.noEventsText}>
            No concerts in {location?.placeName} between{'\n'}
            {startDate?.toLocaleDateString()} - {endDate?.toLocaleDateString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        {isLoadingEvents && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#00ff41"/>
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        )}

        <MapView style={styles.map} initialRegion={initialRegion}>
          {location && (
            <Marker
              coordinate={{latitude: location.lat, longitude: location.lng}}
              title="You are here"
              pinColor="blue"
            />
          )}
          {events &&
            events._embedded?.events.map((event) => {
              const venue = event._embedded?.venues?.[0];
              if (!venue || !venue.location) return null;
              const lat = parseFloat(venue.location.latitude);
              const lng = parseFloat(venue.location.longitude);

              // Platform-specific props
              const markerProps = Platform.select({
                ios: {
                  onSelect: () => {handleMarkerPress(event); },
                },
                android: {
                  onPress: () => {handleMarkerPress(event); },
                },
              });

              return (
                <Marker
                  key={event.id}
                  coordinate={{ latitude: lat, longitude: lng }}
                  pinColor="red"
                  {...markerProps}
                />
              );
            })}
        </MapView>

        <NoEventsOverlay/>

        <Modalize
          ref={modalizeRef}
          modalStyle={styles.modalize}
          handleStyle={styles.handle}
          adjustToContentHeight={false}
          modalHeight={400}
          onClosed={() => {setSelectedEvent(null)}}>
          {renderModalContent()}
        </Modalize>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  map: {flex: 1},
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  noEventsOverlay: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  noEventsCard: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  noEventsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  noEventsText: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalize: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 0,
    backgroundColor: 'white',
  },
  handle: {
    backgroundColor: '#ccc',
    width: 40,
    height: 6,
    borderRadius: 3,
    alignSelf: 'center',
    marginVertical: 10,
  },
  modalContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalVenue: {
    fontSize: 15,
    color: '#333',
    marginBottom: 6,
    textAlign: 'center',
  },
  modalDate: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#007bff',
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
