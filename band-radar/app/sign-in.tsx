import { useEffect, useRef } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import {
  View,
  Text,
  Animated,
  Pressable,
  Image,
  StyleSheet,
  Dimensions,
  Button,
} from 'react-native';
import { useSession } from '~/context/ctx';
import { Ionicons } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

export const SCHEMA = process.env.EXPO_PUBLIC_APP_SCHEME;

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

const { width, height } = Dimensions.get('window');

export default function SignIn() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!,
      scopes: ['user-read-private', 'user-read-email'],
      redirectUri: makeRedirectUri({
        scheme: SCHEMA,
      }),
    },
    discovery
  );

  const { signIn } = useSession();

  // Animation refs
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.5)).current;
  const titlePulse = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Sequence of animations
    const animateIn = () => {
      // Title animation
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(titleScale, {
          toValue: 1,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();

      // Logo animation
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(logoScale, {
            toValue: 1,
            tension: 60,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      }, 300);

      // Content animation
      setTimeout(() => {
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }, 800);

      // Button animation
      setTimeout(() => {
        Animated.spring(buttonScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }).start();
      }, 1200);
    };

    animateIn();

    // Continuous title pulse animation
    const pulseAnimation = () => {
      Animated.sequence([
        Animated.timing(titlePulse, {
          toValue: 1.05,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(titlePulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]).start(() => pulseAnimation());
    };

    setTimeout(pulseAnimation, 2000);
  }, []);

  async function signInWithRefreshToken() {
    const res = await fetch('/api/auth/refresh', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ refresh_token: process.env.EXPO_PUBLIC_SPOTIFY_REFRESH_TOKEN }),
    });

    const data = await res.json();

    const newData = {
      ...data,
      refresh_token: process.env.EXPO_PUBLIC_SPOTIFY_REFRESH_TOKEN,
    };

    signIn(newData);
  }

  useEffect(() => {
    const fetchTokens = async () => {
      console.log('response', response);
      if (response?.type === 'success') {
        const { code } = response.params;

        const res = await fetch('/api/auth/exchange', {
          method: 'POST',
          body: JSON.stringify({ code, codeVerifier: request?.codeVerifier }),
        });

        const data = await res.json();
        signIn(data);
      }
    };

    fetchTokens();
  }, [response, request?.codeVerifier, signIn]);

  return (
    <View style={styles.container}>
      {/* Animated Background Elements */}
      <View />

      {/* Title with Animation */}
      <Animated.View
        style={[
          styles.titleContainer,
          {
            opacity: titleOpacity,
            transform: [{ scale: titleScale }, { scale: titlePulse }],
          },
        ]}>
        <View style={styles.titleWrapper}>
          <Text style={styles.titleBand}>Band</Text>
          <Text style={styles.titleRadar}>Radar</Text>
        </View>

        {/* Animated underline */}
        <Animated.View style={[styles.titleUnderline, { opacity: titleOpacity }]} />
      </Animated.View>

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}>
        <View style={styles.logoWrapper}>
          <View />

          <View style={styles.logoImageContainer}>
            <Image
              source={require('~/assets/BandRadarIcon.jpg')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
        </View>
      </Animated.View>

      {/* Description Text */}
      <Animated.View style={[styles.descriptionContainer, { opacity: contentOpacity }]}>
        <Text style={styles.descriptionText}>
          Discover live {'\n'} <Text style={styles.descriptionHighlight}>music</Text> based on your{' '}
          <Text style={styles.descriptionHighlight}>vibe</Text>
        </Text>
      </Animated.View>

      {/* Login Button */}
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            transform: [{ scale: buttonScale }],
            opacity: contentOpacity,
          },
        ]}>
        <Pressable
          disabled={!request}
          onPress={() => promptAsync()}
          style={({ pressed }) => [styles.loginButton, pressed && styles.loginButtonPressed]}>
          <View style={styles.buttonContent}>
            <Ionicons name="musical-notes" size={24} color="#000000" />
            <Text style={styles.buttonText}>Continue with Spotify</Text>
          </View>
        </Pressable>

        {/* Button glow effect */}
        <View style={styles.buttonGlow} />
      </Animated.View>

      <Animated.View style={[styles.refreshButtonContainer, { opacity: contentOpacity }]}>
        <Button
          title="Sign in with refresh token"
          onPress={async () => {
            signInWithRefreshToken();
          }}
        />
      </Animated.View>

      {/* Bottom tagline */}
      <Animated.View style={[styles.taglineContainer, { opacity: contentOpacity }]}>
        <Text style={styles.taglineText}>Your next favorite show is waiting</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  titleContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleBand: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  titleRadar: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00ff41',
  },
  titleUnderline: {
    height: 2,
    width: 200,
    backgroundColor: '#00ff41',
    marginTop: 8,
    borderRadius: 1,
  },
  logoContainer: {
    marginBottom: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImageContainer: {
    width: width * 0.8,
    height: width * 0.5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  descriptionContainer: {
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  descriptionText: {
    fontSize: 18,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 24,
  },
  descriptionHighlight: {
    color: '#00ff41',
    fontWeight: '600',
  },
  buttonContainer: {
    width: width * 0.8,
    height: width * 0.15,
    position: 'relative',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButton: {
    backgroundColor: '#00ff41',
    borderRadius: 18,
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 4,
    textAlign: 'center',
  },
  buttonGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: '#00ff41',
    borderRadius: 18,
    opacity: 1,
    zIndex: -2,
  },
  refreshButtonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  taglineContainer: {
    position: 'absolute',
    bottom: 64,
  },
  taglineText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
  },
});
