import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { Button } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export const SCHEMA = 'exp://10.10.1.71:8081';
// Endpoint
const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

export default function App() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!,
      scopes: ['user-read-private', 'user-read-email'],
      redirectUri: makeRedirectUri({
        scheme: SCHEMA,
      }),
    },
    discovery
  );

  useEffect(() => {
    const fetchTokens = async () => {
      if (response?.type === 'success') {
        const { code } = response.params;

        const res = await fetch('/api/auth/exchange', {
          method: 'POST',
          body: JSON.stringify({ code, codeVerifier: request?.codeVerifier }),
        });

        const data = await res.json();

        console.log(data);
      }
    };

    fetchTokens();
  }, [response, request?.codeVerifier]);

  return (
    <Button
      disabled={!request}
      title="Login"
      onPress={() => {
        promptAsync();
      }}
    />
  );
}
