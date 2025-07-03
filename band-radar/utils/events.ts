import { TicketmasterEventResponse } from '~/types';

export async function getEvents({
  classificationName,
  startDateTime,
  endDateTime,
  latlong,
  radius,
  unit,
  genreId,
  sort = 'date,asc',
}: {
  classificationName: string;
  startDateTime: string;
  endDateTime: string;
  latlong: [number, number];
  radius: number;
  unit: string;
  genreId: string[];
  sort?: string;
}): Promise<TicketmasterEventResponse | null> {
  try {
    const response = await fetch(
      process.env.EXPO_PUBLIC_API_BASE_URL + '/api/ticketmaster/events',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classificationName,
          startDateTime,
          endDateTime,
          latlong,
          radius,
          unit,
          genreId,
          sort,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching events:', error);
    return null;
  }
}
