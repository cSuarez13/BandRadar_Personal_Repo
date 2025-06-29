import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useStorageState } from '~/context/useStorageState'; // Adjust the import path as needed
import { getEvent } from '~/utils/event';
import { router } from 'expo-router';

export default function Favorites() {
    // Load favorite concert IDs from storage
    const [[, favoriteIds]] = useStorageState<string[]>('favoriteConcerts');
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!favoriteIds || favoriteIds.length === 0) {
                setEvents([]);
                return;
            }
            setLoading(true);
            try {
                // Fetch each favorite event by ID
                const results = await Promise.all(
                    favoriteIds.map(id => getEvent(id))
                );
                setEvents(results.filter(Boolean)); // Remove nulls
            } finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, [favoriteIds]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
                <ActivityIndicator size="large" color="#1DB954" />
                <Text style={{ color: 'white', marginTop: 10 }}>Loading favorites...</Text>
            </View>
        );
    }

    if (!events.length) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
                <Text style={{ color: 'white' }}>No favorite concerts yet.</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#121212' }}>
            <FlatList
                data={events}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => router.push({ pathname: '/[id]', params: { id: item.id } })}
                        style={{
                            backgroundColor: '#696464',
                            borderRadius: 12,
                            marginBottom: 16,
                            width: 320,
                            alignSelf: 'center',
                            overflow: 'hidden',
                            position: 'relative',
                        }}>
                        {item.images?.[0]?.url && (
                            <Image
                                source={{ uri: item.images[0].url }}
                                style={{ width: '100%', height: 160 }}
                                resizeMode="cover"
                            />
                        )}
                        <View style={{ padding: 12 }}>
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
                            <Text style={{ color: '#f0f0f0', marginTop: 4 }}>
                                📍 {item._embedded?.venues?.[0]?.name} | 🗓️ {item.dates?.start?.localDate}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingVertical: 32 }}
            />
        </View>
    );
}
