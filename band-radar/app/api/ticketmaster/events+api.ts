export async function POST(request: Request) {
  const { classificationName, startDateTime, endDateTime, latlong, radius, unit, genreId } =
    await request.json();

  console.log(classificationName, startDateTime, endDateTime, latlong, radius, unit, genreId);
  try {
    const response = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events.json?classificationName=${classificationName}&startDateTime=${startDateTime}&endDateTime=${endDateTime}&apikey=${process.env.TICKETMASTER_API_KEY}&latlong=${latlong.join(',')}&radius=${radius}&unit=${unit}&genreId=${genreId.join(',')}`
    );

    const data = await response.json();

    console.log(data);
    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
