import { useLocalSearchParams } from 'expo-router';
import { eventDetailStyles as styles } from './eventDetailStyles';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import ImageZoom from 'react-native-image-pan-zoom';
import { Event, ExternalLinks } from '~/types';
import { getEvent } from '~/utils/event';

import { SocialButton } from '~/components/SocialButton';
import { VenueButton } from '~/components/VenueButton';

export default function Id() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const [spinValue] = useState(new Animated.Value(0));
  const [pulseValue] = useState(new Animated.Value(1));

  useEffect(() => {
    // Start animations
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    if (loading) {
      spinAnimation.start();
      pulseAnimation.start();
    }

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
    };
  }, [loading, spinValue, pulseValue]);

  useEffect(() => {
    async function fetchEvent() {
      if (typeof id === 'string') {
        try {
          setLoading(true);
          const event = await getEvent(id);
          setData(event);
        } catch (error) {
          console.error('Error fetching event:', error);
          setError('Failed to load event.');
        } finally {
          setLoading(false);
        }
      }
    }

    fetchEvent();
  }, [id]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: '#121212' }]}>
        <View
          style={{
            alignItems: 'center',
            padding: 32,
          }}>
          {/* Spinning music note icon */}
          <Animated.View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(0, 255, 65, 0.1)',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
              borderWidth: 2,
              borderColor: 'rgba(0, 255, 65, 0.3)',
              transform: [{ rotate: spin }],
            }}>
            <Text style={{ fontSize: 32 }}>🎵</Text>
          </Animated.View>

          {/* Pulsing loading text */}
          <Animated.View style={{ transform: [{ scale: pulseValue }] }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#00ff41',
                marginBottom: 16,
              }}>
              Loading Event
            </Text>
          </Animated.View>

          {/* Activity indicator */}
          <ActivityIndicator size="large" color="#00ff41" style={{ marginBottom: 16 }} />

          {/* Loading message */}
          <Text
            style={{
              color: '#e0e0e0',
              fontSize: 16,
              marginBottom: 24,
              textAlign: 'center',
            }}>
            Getting event details...
          </Text>

          {/* Progress dots */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Animated.Text style={[{ color: '#00ff41', fontSize: 20 }, { opacity: pulseValue }]}>
              ●
            </Animated.Text>
            <Animated.Text style={[{ color: '#00ff41', fontSize: 20 }, { opacity: pulseValue }]}>
              ●
            </Animated.Text>
            <Animated.Text style={[{ color: '#00ff41', fontSize: 20 }, { opacity: pulseValue }]}>
              ●
            </Animated.Text>
          </View>
        </View>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Event not found.'}</Text>
      </View>
    );
  }

  const eventImage = data.images?.[1]?.url ? data.images?.[1]?.url : data.images?.[0]?.url;
  const eventName = data.name;
  const eventInfo = data.info;
  const eventNote = data.pleaseNote;
  const eventUrl = data.url;
  const date = data.dates?.start?.localDate;
  const time = data.dates?.start?.localTime;
  const timezone = data.dates?.timezone;
  const status = data.dates?.status?.code;
  const venue = data._embedded?.venues?.[0];
  const venueUrl = venue?.url;
  const artist = data._embedded?.attractions?.[0];
  const artistLinks: ExternalLinks | undefined = artist?.externalLinks;
  const sales = data.sales;
  const seatmap = data.seatmap?.staticUrl;
  const genre = artist?.classifications?.[0]?.subGenre?.name;
  const artistImage = artist?.images?.[0]?.url;
  const venueImage = venue?.images?.[0]?.url;
  const deviceWidth = Dimensions.get('window').width;

  const allowedPlatforms = ['youtube', 'twitter', 'instagram', 'facebook', 'homepage'];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.title}>{eventName}</Text>
          {eventImage && <Image source={{ uri: eventImage }} style={styles.mainImage} />}
          <Text style={styles.status}>{status?.toUpperCase()}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Date & Time</Text>
          <Text style={styles.text}>
            {date} {time ? `at ${time}` : ''} {timezone ? `(${timezone})` : ''}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Venue</Text>
          <Text style={[styles.text, styles.bold]}>{venue?.name}</Text>
          {venueUrl && <VenueButton url={venueUrl} />}
          <Text style={styles.text}>{venue?.address?.line1}</Text>
          <Text style={styles.text}>
            {venue?.city?.name}, {venue?.state?.name}, {venue?.country?.name}
          </Text>
          {venueImage && <Image source={{ uri: venueImage }} style={styles.venueImage} />}
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Artist</Text>
          <Text style={[styles.text, styles.bold]}>{artist?.name}</Text>
          {artistImage && <Image source={{ uri: artistImage }} style={styles.artistImage} />}
          {genre && <Text style={styles.text}>Genre: {genre}</Text>}
          {artistLinks && (
            <View style={styles.socialLinksContainer}>
              {allowedPlatforms.map(
                (platform) =>
                  artistLinks?.[platform as keyof ExternalLinks]?.[0]?.url && (
                    <SocialButton
                      key={platform}
                      platform={platform}
                      url={artistLinks?.[platform as keyof ExternalLinks]?.[0]?.url || '#'}
                    />
                  )
              )}
            </View>
          )}
        </View>

        {eventInfo && (
          <View style={styles.card}>
            <Text style={styles.section}>Info</Text>
            <Text style={styles.text}>{eventInfo}</Text>
          </View>
        )}

        {eventNote && (
          <View style={styles.card}>
            <Text style={styles.section}>Note</Text>
            <Text style={styles.text}>{eventNote}</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.section}>Tickets</Text>
          <TouchableOpacity style={styles.ticketButton} onPress={() => Linking.openURL(eventUrl)}>
            <Text style={styles.ticketText}>Buy Tickets on Ticketmaster</Text>
          </TouchableOpacity>
          {sales?.public?.startDateTime && (
            <Text style={styles.text}>Sales Start: {sales.public.startDateTime}</Text>
          )}
        </View>

        {seatmap && (
          <View style={styles.card}>
            <Text style={styles.section}>Seat Map</Text>
            <View style={styles.seatmapContainer}>
              {/* @ts-ignore*/}
              <ImageZoom
                cropWidth={deviceWidth - 40}
                cropHeight={240}
                imageWidth={deviceWidth - 40}
                imageHeight={240}>
                <Image
                  source={{ uri: seatmap }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="contain"
                />
              </ImageZoom>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
