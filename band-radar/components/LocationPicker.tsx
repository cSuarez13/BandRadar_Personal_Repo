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
        setLocation({ lat: location.coords.latitude, lng: location.coords.longitude });
      }
    }

    getCurrentLocation();
  }, [setLocation, location]);

  if (errorMsg) {
    return <Text>{errorMsg}</Text>;
  }

  const handlePlaceSelect = (place: Place) => {
    console.log('Selected place:', place);
  };

  return (
    <GooglePlacesTextInput
      apiKey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!}
      onPlaceSelect={handlePlaceSelect}
    />
  );
}
