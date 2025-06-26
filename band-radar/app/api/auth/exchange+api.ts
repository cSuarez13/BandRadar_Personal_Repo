export async function POST(request: Request) {
  const { code, codeVerifier } = await request.json();

  const client_id = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET!;

  const { url, ...init } = getTokenReqConfig(
    {
      code,
      redirect_uri: process.env.EXPO_PUBLIC_APP_SCHEME!,
      grant_type: 'authorization_code',
      client_secret,
      client_id,
      code_verifier: codeVerifier,
    },
    {
      client_id,
      client_secret,
    }
  );

  const res = await fetch(url, init);
  const tokens = await res.json();

  return Response.json({ ...tokens });
}

function getTokenReqConfig(
  body: Record<string, string>,
  { client_id, client_secret }: { client_id: string; client_secret: string }
) {
  const BASIC = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

  return {
    url: 'https://accounts.spotify.com/api/token',
    method: 'POST',
    headers: {
      Authorization: `Basic ${BASIC}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body),
  };
}
