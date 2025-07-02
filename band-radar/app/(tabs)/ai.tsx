import { generateAPIUrl } from '~/utils/utils';
import { useChat } from '@ai-sdk/react';
import { fetch as expoFetch } from 'expo/fetch';
import { View, TextInput, ScrollView, Text, SafeAreaView } from 'react-native';
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
} from '~/components/ChatBubble';

export default function Ai() {
  const { messages, error, handleInputChange, input, handleSubmit } = useChat({
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    api: generateAPIUrl('/api/chat'),
    onError: (error) => console.error(error, 'ERROR'),
    maxSteps: 5,
  });

  if (error) return <Text>{error.message}</Text>;

  return (
    <SafeAreaView style={{ height: '100%', backgroundColor: '#111111' }}>
      <View
        style={{
          height: '95%',
          display: 'flex',
          flexDirection: 'column',
          paddingHorizontal: 8,
        }}>
        <ScrollView style={{ flex: 1 }}>
          {messages.map((m) => (
            <ChatBubble
              key={m.id}
              variant={m.role === 'user' ? 'sent' : 'received'}
              style={{ marginVertical: 8 }}>
              <ChatBubbleAvatar
                fallback={m.role === 'user' ? 'U' : 'AI'}
                style={{ width: 24, height: 24 }}
              />
              <ChatBubbleMessage variant={m.role === 'user' ? 'sent' : 'received'}>
                <Text style={{ color: 'black' }}>
                  {m.toolInvocations ? JSON.stringify(m.toolInvocations, null, 2) : m.content}
                </Text>
                <ChatBubbleTimestamp timestamp={new Date().toLocaleTimeString()} />
              </ChatBubbleMessage>
            </ChatBubble>
          ))}
        </ScrollView>

        <View style={{ marginTop: 8 }}>
          <TextInput
            style={{ backgroundColor: 'white', padding: 8 }}
            placeholder="Say something..."
            value={input}
            onChange={(e) =>
              handleInputChange({
                ...e,
                target: {
                  ...e.target,
                  value: e.nativeEvent.text,
                },
              } as unknown as React.ChangeEvent<HTMLInputElement>)
            }
            onSubmitEditing={(e) => {
              handleSubmit(e);
              e.preventDefault();
            }}
            autoFocus={true}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
