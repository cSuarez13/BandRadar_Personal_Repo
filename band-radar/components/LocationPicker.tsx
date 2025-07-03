import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { useSession } from '~/context/ctx';
import GooglePlacesTextInput, { Place } from 'react-native-google-places-textinput';
import { Text, View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchPlaceDetails } from '~/utils/place_details';

export default function LocationPicker() {
  const { location, setLocation } = useSession();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      if (!location) {
        try {
          setIsGettingLocation(true);
          let currentLocation = await Location.getCurrentPositionAsync({});
          setLocation({
            lat: currentLocation.coords.latitude,
            lng: currentLocation.coords.longitude,
            placeName: 'Current Location',
          });
        } catch (error) {
          console.error('Error getting location:', error);
          setErrorMsg('Failed to get current location');
        } finally {
          setIsGettingLocation(false);
        }
      }
    }

    getCurrentLocation();
  }, [setLocation, location]);

  const handleUseCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        lat: currentLocation.coords.latitude,
        lng: currentLocation.coords.longitude,
        placeName: 'Current Location',
      });
    } catch (error) {
      console.error('Error getting current location:', error);
      setErrorMsg('Failed to get current location');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handlePlaceSelect = async (place: Place) => {
    const placeDetails = await fetchPlaceDetails(
      place.placeId,
      place.structuredFormat.mainText.text
    );
    if (placeDetails) {
      setLocation(placeDetails);
    }
  };

  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => setErrorMsg(null)}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.locationInputContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="location" size={20} color="#00ff41" />
        </View>

        {/* Wrapper with relative positioning and fixed size */}
        <View style={styles.inputWrapper}>
          <GooglePlacesTextInput
            apiKey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!}
            onPlaceSelect={handlePlaceSelect}
            fetchDetails={false}
            onError={(error) => {
              console.log('Google Places API Error:', error);
            }}
            style={{
              container: {
                width: '100%',
                backgroundColor: '#2a2a2a',
                height: 48,
              },
              input: {
                backgroundColor: '#2a2a2a',
                color: 'white',
                borderWidth: 1,
                borderColor: '#555',
                borderRadius: 8,
                paddingHorizontal: 10,
                height: 48,
              },
              suggestionsContainer: {
                position: 'absolute',
                top: 50,
                left: 0,
                right: 0,
                backgroundColor: '#2a2a2a',
                zIndex: 999,
                maxHeight: 200,
              },
              suggestionText: {
                main: { color: 'white' },
                secondary: { color: 'white' },
              },
            }}
          />
        </View>

        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleUseCurrentLocation}
          disabled={isGettingLocation}>
          <Ionicons name="locate" size={18} color={isGettingLocation ? '#666' : '#00ff41'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 1000,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 65, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'relative',
    overflow: 'visible',
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 2px 4px rgba(0, 255, 65, 0.1)',
        }
      : {
          shadowColor: '#00ff41',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }),
  },
  iconContainer: {
    marginRight: 10,
    marginTop: 4,
  },
  inputWrapper: {
    position: 'relative',
    flex: 1,
  },
  currentLocationButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 255, 65, 0.1)',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    borderRadius: 8,
    margin: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.3)',
  },
  errorText: {
    color: '#ff5252',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#ff5252',
    padding: 8,
    borderRadius: 6,
    alignSelf: 'center',
  },
  retryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
