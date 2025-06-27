export async function GET(request: Request, { event }: Record<string, string>) {
  try {
    const response = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events/${event}?apikey=${process.env.TICKETMASTER_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch event');
    }

    const result = await response.json();

    return Response.json(result);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}
