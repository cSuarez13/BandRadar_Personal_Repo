import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { Button } from 'react-native';
import { useSession } from '~/context/ctx';

WebBrowser.maybeCompleteAuthSession();

export const SCHEMA = process.env.EXPO_PUBLIC_APP_SCHEME;
// Endpoint
const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

export default function SignIn() {
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

  const { signIn } = useSession();

  useEffect(() => {
    const fetchTokens = async () => {
      if (response?.type === 'success') {
        const { code } = response.params;

        const res = await fetch('/api/auth/exchange', {
          method: 'POST',
          body: JSON.stringify({ code, codeVerifier: request?.codeVerifier }),
        });

        const data = await res.json();

        signIn(data);
      }
    };

    fetchTokens();
  }, [response, request?.codeVerifier, signIn]);

  async function signInWithRefreshToken() {
    const res = await fetch('/api/auth/refresh', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ refresh_token: process.env.EXPO_PUBLIC_SPOTIFY_REFRESH_TOKEN }),
    });

    const data = await res.json();

    const newData = {
      ...data,
      refresh_token: process.env.EXPO_PUBLIC_SPOTIFY_REFRESH_TOKEN,
    };

    signIn(newData);
  }

  return (
    <>
      <Button
        disabled={!request}
        title="Login"
        onPress={() => {
          promptAsync();
        }}
      />

      <Button
        title="Sign in with refresh token"
        onPress={async () => {
          signInWithRefreshToken();
        }}
      />
    </>
  );
}
