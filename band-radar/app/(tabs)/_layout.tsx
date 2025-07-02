import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useSession } from '~/context/ctx';

const bandradar = require('~/assets/defaultIcon.png');

export const unstable_settings = {
  initialRouteName: '(root)',
};

export default function AppLayout() {
  const { session, signOut } = useSession();

  const imageUrl = session?.user.images?.[0]?.url
    ? { uri: session?.user.images?.[0]?.url }
    : bandradar;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#00ff41',
        tabBarStyle: { backgroundColor: '#111111', height: 85, paddingTop: 5 },
        headerStyle: { height: 115, backgroundColor: '#00ff41' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Recommended',

          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
          headerLeft: () => (
            <View style={{ ...styles.circle, marginLeft: 10 }}>
              <Image
                source={imageUrl}
                style={styles.icon}
                resizeMode="contain" // Ensures the whole image fits inside
              />
            </View>
          ),
          headerRight: () => (
            <Pressable onPress={() => signOut()} style={{ marginRight: 10 }}>
              <Ionicons name="log-out-outline" size={24} color="black" />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="star" color={color} />,
          headerLeft: () => (
            <View style={{ ...styles.circle, marginLeft: 10 }}>
              <Image
                source={imageUrl}
                style={styles.icon}
                resizeMode="contain" // Ensures the whole image fits inside
              />
            </View>
          ),
          headerRight: () => (
            <Pressable onPress={() => signOut()} style={{ marginRight: 10 }}>
              <Ionicons name="log-out-outline" size={24} color="black" />
            </Pressable>
          ),
        }}
      />
        <Tabs.Screen
            name="maps"
            options={{
                title: 'Maps',
                tabBarIcon: ({ color }) => <FontAwesome size={28} name="map" color={color} />,
                headerLeft: () => (
                    <View style={{ ...styles.circle, marginLeft: 10 }}>
                        <Image
                            source={imageUrl}
                            style={styles.icon}
                            resizeMode="contain" // Ensures the whole image fits inside
                        />
                    </View>
                ),
                headerRight: () => (
                    <Pressable onPress={() => signOut()} style={{ marginRight: 10 }}>
                        <Ionicons name="log-out-outline" size={24} color="black" />
                    </Pressable>
                ),
            }}
        />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#eee', // Optional: fallback background
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  icon: {
    width: 30, // Smaller than the circle
    height: 30,
    borderRadius: 1000, // Optional: slight rounding for the square
  },
});
