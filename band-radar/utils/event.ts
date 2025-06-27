import { Event } from '~/types';

export async function getEvent(id: string): Promise<Event | null> {
  try {
    const response = await fetch(`/api/ticketmaster/event/${id}`);

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
