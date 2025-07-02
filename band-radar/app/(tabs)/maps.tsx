import React, {useEffect, useState, useRef} from 'react';
import {View, ActivityIndicator, StyleSheet, Text, TouchableOpacity} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {Modalize} from 'react-native-modalize';

import {getEvents} from '~/utils/events';
import {useSession} from '~/context/ctx';
import {TicketmasterEventResponse, Event} from '~/types';
import {GestureHandlerRootView} from "react-native-gesture-handler";


export default function ConcertMapPage() {
    const {isCompilingGenres, genres, location, date} = useSession();
    const [events, setEvents] = useState<TicketmasterEventResponse | null>(null);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    const modalizeRef = useRef<Modalize | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            if (!date) return;
            if (genres && location) {
                const startDateTime =
                    new Date(date.setHours(0, 0, 0, 0)).toISOString().split('.')[0] + 'Z';
                const endDateTime =
                    new Date(date.setHours(23, 59, 59, 999)).toISOString().split('.')[0] + 'Z';

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
    }, [genres, location, date]);

    const initialRegion = {
        latitude: location?.lat || 37.7749,
        longitude: location?.lng || -122.4194,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    };

    // Open the modalize bottom sheet
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
                <Text style={styles.modalVenue}>{venueName}{city ? `, ${city}` : ''}</Text>
                <Text style={styles.modalDate}>{date}{time ? ` • ${time}` : ''}</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => modalizeRef.current?.close()}>
                    <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <GestureHandlerRootView>
            <View style={styles.container}>
                {isLoadingEvents && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#0000ff"/>
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
                    {events && events._embedded?.events.map((event) => {
                        const venue = event._embedded?.venues?.[0];
                        if (!venue || !venue.location) return null;
                        const lat = parseFloat(venue.location.latitude);
                        const lng = parseFloat(venue.location.longitude);

                        return (
                            <Marker
                                key={event.id}
                                coordinate={{latitude: lat, longitude: lng}}
                                onPress={() => handleMarkerPress(event)}
                            />
                        );
                    })}
                </MapView>

                <Modalize
                    ref={modalizeRef}
                    modalStyle={styles.modalize}
                    handleStyle={styles.handle}
                    adjustToContentHeight={false}
                    modalHeight={400} // or use height: '50%' in modalStyle for half screen
                    onClosed={() => setSelectedEvent(null)}
                >
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
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
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
