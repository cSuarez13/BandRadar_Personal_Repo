import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { useSession } from '~/context/ctx';
import GooglePlacesTextInput, { Place } from 'react-native-google-places-textinput';
import { Text } from 'react-native';

export default function LocationPicker() {
  const { location, setLocation } = useSession();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      if (!location) {
        let location = await Location.getCurrentPositionAsync({});
        setLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          placeName: 'Current Location',
        });
      }
    }

    getCurrentLocation();
  }, [setLocation, location]);

  if (errorMsg) {
    return <Text>{errorMsg}</Text>;
  }

  const handlePlaceSelect = (place: Place) => {
    console.log('Selected place:', place);
    console.log('Place ID:', place.placeId);

    // Make a direct API call to get coordinates from the place ID
    fetchPlaceDetails(place.placeId, place.structuredFormat.mainText.text);
  };

  const fetchPlaceDetails = async (placeId: string, placeName: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      console.log('Place details response:', data);

      if (data.result && data.result.geometry && data.result.geometry.location) {
        const { lat, lng } = data.result.geometry.location;
        console.log('Coordinates:', { lat, lng });
        setLocation({ lat, lng, placeName });
      }
    } catch (error) {
      console.log('Error fetching place details:', error);
    }
  };

  return (
    <GooglePlacesTextInput
      apiKey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!}
      onPlaceSelect={handlePlaceSelect}
      fetchDetails={false}
      onError={(error) => {
        console.log('Google Places API Error:', error);
      }}
    />
  );
}
