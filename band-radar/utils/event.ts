import { Event } from '~/types';

export async function getEvent(id: string, baseURL?: string): Promise<Event | null> {
  let url = `/api/ticketmaster/event/${id}`;

  if (baseURL) {
    url = baseURL + `/api/ticketmaster/event/${id}`;
  }
  try {
    const response = await fetch(url);

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
