import { generateAPIUrl } from '~/utils/utils';
import { useChat } from '@ai-sdk/react';
import { fetch as expoFetch } from 'expo/fetch';
import {
  View,
  TextInput,
  ScrollView,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
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
    <View style={{ flex: 1, backgroundColor: '#111111' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
          <View style={{ flex: 1, paddingHorizontal: 8 }}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
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

            <View
              style={{
                borderTopWidth: 1,
                borderColor: '#8E8E8F',
                marginHorizontal: -8,
                paddingHorizontal: 8,
                paddingTop: 8,
                paddingBottom: 8,
              }}>
              <TextInput
                style={{
                  backgroundColor: 'white',
                  padding: 12,
                  borderRadius: 8,
                  color: 'black',
                  borderWidth: 1,
                  fontSize: 16,
                }}
                placeholder="Say something..."
                placeholderTextColor="#666"
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
                  Keyboard.dismiss();
                }}
                returnKeyType="send"
                blurOnSubmit={false}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
