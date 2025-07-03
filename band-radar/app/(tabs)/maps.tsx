import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Modalize } from 'react-native-modalize';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { getEvents } from '~/utils/events';
import { useSession } from '~/context/ctx';
import { TicketmasterEventResponse, Event } from '~/types';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

export default function ConcertMapPage() {
  const { isCompilingGenres, genres, location, startDate, endDate, toggleFavorite, favoriteIds } =
    useSession();
  const [events, setEvents] = useState<TicketmasterEventResponse | null>(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [mapReady, setMapReady] = useState(false);

  const modalizeRef = useRef<Modalize | null>(null);
  const mapRef = useRef<MapView | null>(null);

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

  // Focus the map on the first event marker or user location when ready
  useEffect(() => {
    if (mapReady && mapRef.current) {
      // Try to focus on the first event marker
      if (events && events._embedded?.events.length > 0) {
        const coords = events._embedded.events
          .map((event) => {
            const venue = event._embedded?.venues?.[0];
            if (venue && venue.location) {
              return {
                latitude: parseFloat(venue.location.latitude),
                longitude: parseFloat(venue.location.longitude),
              };
            }
            return null;
          })
          .filter(Boolean);

        if (coords.length === 1) {
          // Focus on the single marker
          mapRef.current.animateToRegion(
            //@ts-ignore
            {
              ...coords[0],
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            },
            500
          );
        } else if (coords.length > 1) {
          // Fit all markers in view
          //@ts-ignore
          mapRef.current.fitToCoordinates(coords, {
            edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
            animated: true,
          });
        }
      } else if (location) {
        // No events: focus on user location
        mapRef.current.animateToRegion(
          {
            latitude: location.lat,
            longitude: location.lng,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          },
          500
        );
      }
    }
  }, [mapReady, events, location]);

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

  const handleViewDetails = () => {
    if (selectedEvent) {
      modalizeRef.current?.close();
      router.push({
        pathname: '/(modal)/[id]',
        params: {
          id: selectedEvent.id,
        },
      });
    }
  };

  const renderModalContent = () => {
    if (!selectedEvent) return null;

    const venue = selectedEvent._embedded?.venues?.[0];
    const artist = selectedEvent._embedded?.attractions?.[0];
    const concertName = selectedEvent.name;
    const artistName = artist?.name;
    const venueName = venue?.name;
    const city = venue?.city?.name;
    const state = venue?.state?.name;
    const date = selectedEvent.dates?.start?.localDate;
    const time = selectedEvent.dates?.start?.localTime;
    const eventImage = selectedEvent.images?.[1]?.url || selectedEvent.images?.[0]?.url;
    const isFavorite = favoriteIds && favoriteIds.includes(selectedEvent.id);

    return (
      <View style={styles.modalContent}>
        {/* Header with image */}
        {eventImage && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: eventImage }} style={styles.eventImage} />
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(selectedEvent.id)}>
              <Ionicons
                name={isFavorite ? 'star' : 'star-outline'}
                size={24}
                color={isFavorite ? '#ef9b0d' : '#fff'}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Event details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.modalTitle}>{concertName}</Text>

          {artistName && (
            <View style={styles.infoRow}>
              <Ionicons name="musical-notes" size={16} color="#00ff41" />
              <Text style={styles.modalArtist}>{artistName}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="location" size={16} color="#00ff41" />
            <Text style={styles.modalVenue}>
              {venueName}
              {city && state ? `, ${city}, ${state}` : city ? `, ${city}` : ''}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={16} color="#00ff41" />
            <Text style={styles.modalDate}>
              {date}
              {time ? ` • ${time}` : ''}
            </Text>
          </View>

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.detailsButton} onPress={handleViewDetails}>
              <Text style={styles.detailsButtonText}>View Details</Text>
              <Ionicons name="arrow-forward" size={16} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => modalizeRef.current?.close()}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const NoEventsOverlay = () => {
    if (isLoadingEvents || !events || events._embedded?.events.length > 0) return null;

    return (
      <View style={styles.noEventsOverlay}>
        <View style={styles.noEventsCard}>
          <Ionicons name="musical-notes-outline" size={48} color="#666" />
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
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        {isLoadingEvents && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#00ff41" />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        )}

        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          onMapReady={() => setMapReady(true)}
          key={events ? events._embedded?.events.map(e => e.id).join(',') : 'no-events'}
        >
          {mapReady && location && (
            <Marker
              coordinate={{ latitude: location.lat, longitude: location.lng }}
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

              return (
                <Marker
                  key={event.id}
                  coordinate={{ latitude: lat, longitude: lng }}
                  onPress={() => handleMarkerPress(event)}
                  pinColor="red"
                />
              );
            })}
        </MapView>

        <NoEventsOverlay />

        <Modalize
          ref={modalizeRef}
          modalStyle={styles.modalize}
          handleStyle={styles.handle}
          adjustToContentHeight={true}
          onClosed={() => setSelectedEvent(null)}>
          {renderModalContent()}
        </Modalize>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#1f1f1f',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  handle: {
    backgroundColor: '#555',
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 12,
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#1f1f1f',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    padding: 20,
    flex: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    lineHeight: 26,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalArtist: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
    flex: 1,
  },
  modalVenue: {
    fontSize: 15,
    color: '#ccc',
    marginLeft: 8,
    flex: 1,
  },
  modalDate: {
    fontSize: 15,
    color: '#ccc',
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  detailsButton: {
    backgroundColor: '#00ff41',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00ff41',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
