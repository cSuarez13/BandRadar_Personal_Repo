export async function POST(request: Request) {
  const { refresh_token } = await request.json();

  const clientId = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
    }),
  });

  const data = await response.json();

  return Response.json(data);
}
