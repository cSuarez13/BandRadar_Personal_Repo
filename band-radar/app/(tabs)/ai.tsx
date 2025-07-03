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
import { Fragment } from 'react/jsx-runtime';
import { useSession } from '~/context/ctx';
import { Event } from '~/types';
import EventItem from '~/components/EventItem';

export default function Ai() {
  const { location, genres } = useSession();
  const currentDate = new Date().toISOString().split('T')?.[0];

  const { messages, error, handleInputChange, input, handleSubmit } = useChat({
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    api: generateAPIUrl('/api/chat'),
    onError: (error) => console.error(error, 'ERROR'),
    maxSteps: 5,
    body: {
      location,
      genres,
      currentDate,
    },
  });

  if (error) return <Text>{error.message}</Text>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#111111' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 8 }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {messages.map((m) => {
              return (
                <Fragment key={m.id}>
                  {m.parts.map((p, i) => {
                    if (p.type === 'text') {
                      return (
                        <Fragment key={`${p.type}-${i}`}>
                          <ChatBubble
                            variant={m.role === 'user' ? 'sent' : 'received'}
                            style={{ marginVertical: 8 }}>
                            <ChatBubbleAvatar
                              fallback={m.role === 'user' ? 'U' : 'AI'}
                              style={{ width: 24, height: 24 }}
                            />
                            <ChatBubbleMessage variant={m.role === 'user' ? 'sent' : 'received'}>
                              <Text style={{ color: 'black' }}>{p.text}</Text>
                            </ChatBubbleMessage>
                          </ChatBubble>
                        </Fragment>
                      );
                    }

                    if (p.type === 'tool-invocation') {
                      if (p.toolInvocation.toolName === 'eventfinder') {
                        if (p.toolInvocation.state === 'call') {
                          return (
                            <Fragment key={`${p.type}-${i}`}>
                              <ChatBubble variant="received" style={{ marginVertical: 8 }}>
                                <Text style={{ color: 'white', fontSize: 12, paddingLeft: 32 }}>
                                  Loading events...
                                </Text>
                              </ChatBubble>
                            </Fragment>
                          );
                        }

                        if (p.toolInvocation.state === 'result') {
                          console.log(p.toolInvocation.result);
                          return (
                            <Fragment key={`${p.type}-${i}`}>
                              <ChatBubble
                                variant={m.role === 'user' ? 'sent' : 'received'}
                                style={{ marginTop: 8 }}>
                                <View
                                  style={{
                                    paddingLeft: 32,
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                  }}>
                                  {p.toolInvocation.result?.events?.events &&
                                    p.toolInvocation.result.events?.events?.map((event: Event) => (
                                      <EventItem key={event.id} item={event} size="small" />
                                    ))}
                                </View>
                              </ChatBubble>
                            </Fragment>
                          );
                        }
                      }
                    }
                  })}
                </Fragment>
              );
            })}
          </ScrollView>

          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: '#111111',
              borderTopWidth: 1,
              borderColor: '#8E8E8F',
              paddingHorizontal: 8,
              paddingTop: 8,
              paddingBottom: Platform.OS === 'ios' ? 34 : 8,
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
              autoFocus={true}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
