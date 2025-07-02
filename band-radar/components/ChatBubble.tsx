import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Image,
} from 'react-native';

// Types for variants
type ChatBubbleVariant = 'received' | 'sent';
type ChatBubbleLayout = 'default' | 'ai' | 'intro';

// ChatBubble main component
interface ChatBubbleProps {
  variant?: ChatBubbleVariant;
  layout?: ChatBubbleLayout;
  style?: ViewStyle;
  children: React.ReactNode;
}

const ChatBubble = React.forwardRef<View, ChatBubbleProps>(
  ({ variant = 'received', layout = 'default', style, children }, ref) => {
    const bubbleStyle = [
      styles.chatBubble,
      variant === 'sent' ? styles.sentBubble : styles.receivedBubble,
      layout === 'ai' && styles.aiLayout,
      layout === 'intro' && styles.introLayout,
      style,
    ];

    return (
      <View ref={ref} style={bubbleStyle}>
        {React.Children.map(children, (child) =>
          React.isValidElement(child) && typeof child.type !== 'string'
            ? React.cloneElement(child, {
                variant,
                layout,
              } as React.ComponentProps<typeof child.type>)
            : child
        )}
      </View>
    );
  }
);
ChatBubble.displayName = 'ChatBubble';

// ChatBubbleAvatar component
interface ChatBubbleAvatarProps {
  src?: string;
  fallback?: string;
  style?: ViewStyle;
}

const ChatBubbleAvatar: React.FC<ChatBubbleAvatarProps> = ({ src, fallback, style }) => (
  <View style={[styles.avatar, style]}>
    {src ? (
      <Image source={{ uri: src }} style={styles.avatarImage} />
    ) : (
      <View style={styles.avatarFallback}>
        <Text style={styles.avatarFallbackText}>
          {fallback ? fallback.charAt(0).toUpperCase() : 'U'}
        </Text>
      </View>
    )}
  </View>
);

// ChatBubbleMessage component
interface ChatBubbleMessageProps {
  variant?: ChatBubbleVariant;
  layout?: ChatBubbleLayout;
  style?: ViewStyle;
  isLoading?: boolean;
  children: React.ReactNode;
}

const ChatBubbleMessage = React.forwardRef<View, ChatBubbleMessageProps>(
  ({ variant = 'received', layout = 'default', style, isLoading = false, children }, ref) => {
    const messageStyle = [
      styles.message,
      variant === 'sent' ? styles.sentMessage : styles.receivedMessage,
      layout === 'ai' && styles.aiMessage,
      layout === 'intro' && styles.introMessage,
      style,
    ];

    return (
      <View ref={ref} style={messageStyle}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>...</Text>
          </View>
        ) : (
          children
        )}
      </View>
    );
  }
);
ChatBubbleMessage.displayName = 'ChatBubbleMessage';

// ChatBubbleTimestamp component
interface ChatBubbleTimestampProps {
  timestamp: string;
  style?: TextStyle;
}

const ChatBubbleTimestamp: React.FC<ChatBubbleTimestampProps> = ({ timestamp, style }) => (
  <Text style={[styles.timestamp, style]}>{timestamp}</Text>
);

// ChatBubbleAction component
interface ChatBubbleActionProps {
  icon: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

const ChatBubbleAction: React.FC<ChatBubbleActionProps> = ({
  icon,
  onPress,
  style,
  disabled = false,
}) => (
  <TouchableOpacity
    style={[styles.action, disabled && styles.actionDisabled, style]}
    onPress={onPress}
    disabled={disabled}>
    {icon}
  </TouchableOpacity>
);

// ChatBubbleActionWrapper component
interface ChatBubbleActionWrapperProps {
  variant?: ChatBubbleVariant;
  style?: ViewStyle;
  children: React.ReactNode;
}

const ChatBubbleActionWrapper = React.forwardRef<View, ChatBubbleActionWrapperProps>(
  ({ variant = 'received', style, children }, ref) => {
    const wrapperStyle = [
      styles.actionWrapper,
      variant === 'sent' ? styles.sentActionWrapper : styles.receivedActionWrapper,
      style,
    ];

    return (
      <View ref={ref} style={wrapperStyle}>
        {children}
      </View>
    );
  }
);
ChatBubbleActionWrapper.displayName = 'ChatBubbleActionWrapper';

// Styles
const styles = StyleSheet.create({
  // ChatBubble styles
  chatBubble: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
    position: 'relative',
  },
  receivedBubble: {
    alignSelf: 'flex-start',
  },
  sentBubble: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  aiLayout: {
    maxWidth: '80%',
    width: '80%',
    alignItems: 'center',
  },
  introLayout: {
    alignItems: 'center',
    height: '100%',
    alignSelf: 'center',
  },

  // Avatar styles
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },

  // Message styles
  message: {
    padding: 16,
    maxWidth: '90%',
    flexDirection: 'column',
    gap: 2,
  },
  receivedMessage: {
    backgroundColor: 'lightgray',
    color: 'black',
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  sentMessage: {
    backgroundColor: '#00ff41', // green-900 equivalent
    color: 'black',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  aiMessage: {
    borderTopWidth: 1,
    width: '100%',
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  introMessage: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#f3f4f6', // gray-100 equivalent
  },

  // Loading styles
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },

  // Timestamp styles
  timestamp: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right',
    color: '#6b7280',
  },

  // Action styles
  action: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  actionDisabled: {
    opacity: 0.5,
  },

  // Action wrapper styles
  actionWrapper: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -12 }],
    opacity: 0,
  },
  receivedActionWrapper: {
    right: -4,
    transform: [{ translateX: 16 }, { translateY: -12 }],
  },
  sentActionWrapper: {
    left: -4,
    transform: [{ translateX: -16 }, { translateY: -12 }],
  },
});

export {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
  ChatBubbleAction,
  ChatBubbleActionWrapper,
};

export type { ChatBubbleVariant, ChatBubbleLayout };
