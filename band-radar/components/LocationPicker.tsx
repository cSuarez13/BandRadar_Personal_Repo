import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { useSession } from '~/context/ctx';

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

  let text = 'Waiting...';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }
  return null;
  // return <Text>{text}</Text>;
}
