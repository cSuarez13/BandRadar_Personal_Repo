import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import { Event, ExternalLinks } from '~/types';
import { getEvent } from '~/utils/event';

import { SocialButton } from '~/components/socialButton';
import { VenueButton } from '~/components/venueButton';

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

  // Extract useful properties and links
  const eventImage = data.images?.[0]?.url;
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
        <Text style={styles.title}>{eventName}</Text>
        {eventImage && <Image source={{ uri: eventImage }} style={styles.mainImage} />}
        <Text style={styles.status}>{status?.toUpperCase()}</Text>

        <Text style={styles.section}>Date & Time</Text>
        <Text style={styles.text}>
          {date} {time ? `at ${time}` : ''} {timezone ? `(${timezone})` : ''}
        </Text>

        <Text style={styles.section}>Venue</Text>
        <Text style={[styles.text, styles.bold]}>{venue?.name}</Text>
        {venueUrl && <VenueButton url={venueUrl} />}
        <Text style={styles.text}>{venue?.address?.line1}</Text>
        <Text style={styles.text}>
          {venue?.city?.name}, {venue?.state?.name}, {venue?.country?.name}
        </Text>
        {venueImage && <Image source={{ uri: venueImage }} style={styles.venueImage} />}

        <Text style={styles.section}>Artist</Text>
        <Text style={[styles.text, styles.bold]}>{artist?.name}</Text>
        {artistImage && <Image source={{ uri: artistImage }} style={styles.artistImage} />}
        {genre && <Text style={styles.text}>Genre: {genre}</Text>}
        {/* DYNAMIC & BEAUTIFUL SOCIAL LINKS */}
        {artistLinks && (
          <View style={styles.socialLinksContainer}>
            {allowedPlatforms.map(
              (platform) =>
                // Check if the link for this platform exists in the API data
                artistLinks?.[platform as keyof ExternalLinks] &&
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

        {eventInfo && (
          <>
            <Text style={styles.section}>Info</Text>
            <Text style={styles.text}>{eventInfo}</Text>
          </>
        )}
        {eventNote && (
          <>
            <Text style={styles.section}>Note</Text>
            <Text style={styles.text}>{eventNote}</Text>
          </>
        )}

        <Text style={styles.section}>Tickets</Text>
        <TouchableOpacity onPress={() => Linking.openURL(eventUrl)}>
          <Text style={styles.link}>Buy Tickets on Ticketmaster</Text>
        </TouchableOpacity>
        {sales?.public?.startDateTime && (
          <Text style={styles.text}>Sales Start: {sales.public.startDateTime}</Text>
        )}

        {seatmap && (
          <>
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
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scroll: {
    padding: 20,
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#fff',
  },
  status: {
    fontSize: 14,
    color: '#1e90ff',
    marginBottom: 8,
    textAlign: 'center',
  },
  section: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 4,
    alignSelf: 'flex-start',
    color: '#fff',
  },
  mainImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
  },
  venueImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginVertical: 8,
  },
  artistImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginVertical: 8,
  },
  seatmapContainer: {
    width: '100%',
    height: 240,
    borderRadius: 8,
    backgroundColor: '#222',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  link: {
    color: '#1e90ff',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    marginBottom: 8,
    fontSize: 16,
  },
  bold: {
    fontWeight: 'bold',
    color: '#fff',
  },
  text: {
    color: '#e0e0e0',
    fontSize: 15,
  },
  loadingText: {
    color: '#e0e0e0',
    marginTop: 10,
  },
  errorText: {
    color: '#ff5252',
    fontSize: 16,
  },
  socialLinksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
    alignSelf: 'center', // Center the container horizontally
    justifyContent: 'center', // Center its children horizontally
  },
  BackButton: {
    position: 'absolute',
    zIndex: 10,
  },
  BackButtonText: {
    color: 'white',
  },
});
