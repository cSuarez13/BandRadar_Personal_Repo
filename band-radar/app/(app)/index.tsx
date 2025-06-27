import { ScrollView, Text, View } from 'react-native';
import LocationPicker from '~/components/LocationPicker';

import { useSession } from '~/context/ctx';

export default function Index() {
  const { signOut, session, isCompilingGenres, genres } = useSession();

  if (isCompilingGenres) {
    return <Text>Compiling genres...</Text>;
  }

  return (
    <ScrollView>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text
          onPress={() => {
            // The `app/(app)/_layout.tsx` will redirect to the sign-in screen.
            signOut();
          }}>
          Sign Out
        </Text>

        <Text>{JSON.stringify(genres, null, 2)}</Text>

        <LocationPicker />

        <Text>{JSON.stringify(session, null, 2)}</Text>
      </View>
    </ScrollView>
  );
}
