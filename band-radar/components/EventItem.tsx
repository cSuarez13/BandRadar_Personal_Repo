import { router } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Event } from '~/types';
import { useSession } from '~/context/ctx';
import { Ionicons } from '@expo/vector-icons';

export default function EventItem({
  item,
  size = 'large',
}: {
  item: Event;
  size?: 'small' | 'large';
}) {
  const { toggleFavorite, favoriteIds } = useSession();

  const image = item.images.find((image) => image.width < 1000) || item.images?.[0];

  return (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: '/(modal)/[id]',
          params: {
            id: item.id,
          },
        });
      }}
      style={{
        borderRadius: 12,
        marginBottom: 16,
        width: '100%',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: 'black',
          padding: 10,
          borderBottomLeftRadius: 12,
        }}>
        <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
            }}>
            {favoriteIds && favoriteIds.includes(item.id) ? (
              <Ionicons name="star" size={24} color="#ef9b0d" />
            ) : (
              <Ionicons name="star-outline" size={24} color="white" />
            )}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Concert image */}
      {item.images?.[0]?.url && size === 'large' && (
        <Image
          source={{ uri: image?.url }}
          style={{
            width: '100%',
            height: 160,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
          resizeMode="cover"
        />
      )}

      {/* Concert name and details */}
      <View style={{ padding: 12 }}>
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
        <Text style={{ color: '#f0f0f0', marginTop: 4 }}>
          📍 {item._embedded?.venues?.[0]?.name} | 🗓️ {item.dates?.start?.localDate}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
