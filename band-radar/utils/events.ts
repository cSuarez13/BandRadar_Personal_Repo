import { TicketmasterEventResponse } from '~/types';

export async function getEvents({
  classificationName,
  startDateTime,
  endDateTime,
  latlong,
  radius,
  unit,
  genreId,
}: {
  classificationName: string;
  startDateTime: string;
  endDateTime: string;
  latlong: [number, number];
  radius: number;
  unit: string;
  genreId: string[];
}): Promise<TicketmasterEventResponse | null> {
  try {
    const response = await fetch('/api/ticketmaster/events', {
      method: 'POST',
      body: JSON.stringify({
        classificationName,
        startDateTime,
        endDateTime,
        latlong,
        radius,
        unit,
        genreId,
      }),
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
