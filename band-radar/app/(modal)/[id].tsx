import { useLocalSearchParams } from 'expo-router';
import { eventDetailStyles as styles } from './eventDetailStyles';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1e90ff" />
        <Text style={styles.loadingText}>Loading event...</Text>
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
            <Text style={styles.text}>Buy Tickets on Ticketmaster</Text>
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
