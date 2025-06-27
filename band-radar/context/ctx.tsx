import { use, createContext, type PropsWithChildren, useEffect, useState } from 'react';
import { useStorageState } from './useStorageState';
import { extractUserPlaylistGenres, GenreCount } from '~/utils/playlists';

export type Session = {
  token: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
  };
  user: {
    country: string;
    display_name: string;
    email: string;
    explicit_content: {
      filter_enabled: boolean;
      filter_locked: boolean;
    };
    external_urls: {
      spotify: string;
    };
    followers: {
      href: string | null;
      total: number;
    };
    href: string | null;
    id: string;
    images: {
      height: number | null;
      url: string;
      width: number | null;
    }[];
    product: string;
    type: string;
    uri: string;
  };
};

const AuthContext = createContext<{
  signIn: (data: Session['token']) => void;
  signOut: () => void;
  session?: Session | null;
  genres: GenreCount[] | null;
  isLoadingGenres: boolean;
  isLoading: boolean;
  isCompilingGenres: boolean;
}>({
  signIn: () => null,
  signOut: () => null,
  session: null,
  genres: null,
  isLoadingGenres: false,
  isLoading: false,
  isCompilingGenres: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState<Session | null>('session');
  const [[isLoadingGenres, genres], setGenres] = useStorageState<GenreCount[] | null>('genres');
  const [isCompilingGenres, setIsCompilingGenres] = useState(false);

  useEffect(() => {
    if (session && !genres) {
      async function getGenres() {
        console.log('settings genres');
        if (!session) return;
        try {
          setIsCompilingGenres(true);

          const genres = await extractUserPlaylistGenres(session.token.access_token);
          setGenres(genres);
        } catch (error) {
          console.error(error);
        } finally {
          setIsCompilingGenres(false);
        }
      }

      getGenres();
    }
  }, [session?.token.access_token, genres, setGenres, isCompilingGenres, session]);

  return (
    <AuthContext
      value={{
        signIn: async (data: Session['token']) => {
          // Perform sign-in logic here
          const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
              Authorization: `Bearer ${data.access_token}`,
              'Content-Type': 'application/json',
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch user');
          }

          const user = await response.json();

          const session = {
            token: {
              ...data,
            },
            user,
          };

          setSession(session);
        },
        signOut: () => {
          setSession(null);
          setGenres(null);
        },
        session,
        isLoading,
        genres,
        isLoadingGenres,
        isCompilingGenres,
      }}>
      {children}
    </AuthContext>
  );
}
