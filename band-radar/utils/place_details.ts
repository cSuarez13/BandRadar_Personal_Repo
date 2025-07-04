export const fetchPlaceDetails = async (placeId: string, placeName: string) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();

    if (data.result && data.result.geometry && data.result.geometry.location) {
      const { lat, lng } = data.result.geometry.location;
      return { lat, lng, placeName };
    }
  } catch (error) {
    console.error('Error fetching place details:', error);
  }
};
