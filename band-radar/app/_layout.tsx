import { Stack } from 'expo-router';
import { SessionProvider, useSession } from '~/context/ctx';
import { SplashScreenController } from '~/components/splash';
import { StatusBar } from 'expo-status-bar';

export default function Root() {
  return (
    <SessionProvider>
      <SplashScreenController />
      <RootNavigator />
    </SessionProvider>
  );
}

function RootNavigator() {
  const { session } = useSession();

  return (
    <Stack>
      <StatusBar style="dark" />
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(modal)" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack.Protected>

      <Stack.Protected guard={!session}>
        <Stack.Screen name="sign-in" options={{ title: 'Sign In', headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
