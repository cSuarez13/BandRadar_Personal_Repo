export async function getPlace(location: string) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${location}&inputtype=textquery&fields=place_id&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`
  );
  const data = await response.json();

  return data;
}
