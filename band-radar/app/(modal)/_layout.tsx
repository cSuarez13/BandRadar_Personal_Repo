import {router, Stack} from 'expo-router';
import {FontAwesome, Ionicons} from '@expo/vector-icons';
import {Pressable, Share, Text, View} from 'react-native';
import {useSession} from '~/context/ctx';
import {eventDetailStyles as styles} from "~/app/(modal)/eventDetailStyles";
import {useEffect, useState} from "react";
import {getEvent} from "~/utils/event";

import {Event} from '~/types';

export default function ModalLayout() {
  const {toggleFavorite, favoriteIds} = useSession();

  const ShareLink = async (link: string) => {
    const result = await Share.share({
      message:
        `Check this event i found on Band Radar\n\n${link}`,
    });
  }

  return (
    <Stack
      screenOptions={{
        title: 'Event',
      }}>
      <Stack.Screen
        name="[id]"
        options={({route}) => ({
          presentation: 'modal',
          headerStyle: {backgroundColor: '#00ff41'},
          title: 'Event',
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black"/>
            </Pressable>
          ),
          headerRight: () => {
            const {id} = route.params as { id: string };
            const [loading, setLoading] = useState<boolean>(false)
            const [data, setData] = useState<Event | null>(null)
            const [error, setError] = useState<string | null>(null)

            useEffect(() => {
              async function fetchEvent() {
                try {
                  setLoading(true);
                  const event = await getEvent(id);
                  setData(event);
                } catch (error) {
                  console.error('Error fetching event:', error);
                  setError('Failed to load event.');
                } finally {
                  setLoading(false);
                }

              }

              fetchEvent();
            }, [id]);

            if (!data || loading) return

            const eventUrl = data.url;

            return (
              <View style={{
                display: "flex",
                width: 80,
                zIndex: 5,
                justifyContent: 'flex-start',
                alignItems: "flex-start",
                flexDirection: 'row',
              }}>
                <Pressable style={{marginLeft: 5, marginRight: 15, zIndex: 3}} onPress={() => {
                  ShareLink(eventUrl)
                }}><FontAwesome size={24} name="share" color={'black'}/>
                </Pressable>

                <Pressable onPress={() => toggleFavorite(id)}>
                  {favoriteIds && favoriteIds.includes(id) ? (
                    <Ionicons name="star" size={24} color="#ef9b0d"/>
                  ) : (
                    <Ionicons name="star-outline" size={24} color="black"/>
                  )}
                </Pressable>

              </View>
            );
          },
        })}
      />
    </Stack>
  );
}
