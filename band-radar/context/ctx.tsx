import { use, createContext, type PropsWithChildren, useEffect, useState } from 'react';
import { useStorageState } from './useStorageState';
import { extractUserPlaylistGenres, GenreCount } from '~/utils/playlists';
import { genreMap } from '~/constants';

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
  isLoading: boolean;

  genres: { id: string; name: string }[] | null;

  isLoadingGenres: boolean;
  isCompilingGenres: boolean;

  isLoadingLocation: boolean;
  location: {
    lat: number;
    lng: number;
    placeName: string;
  } | null;
  setLocation: (location: { lat: number; lng: number; placeName: string }) => void;

  toggleFavorite: (id: string) => void;
  isLoadingFavoriteIds: boolean;
  favoriteIds: string[] | null;
  setFavoriteIds: (ids: string[]) => void;
}>({
  signIn: () => null,
  signOut: () => null,

  session: null,
  isLoading: false,

  genres: null,
  isLoadingGenres: false,

  isCompilingGenres: false,

  isLoadingLocation: false,
  location: null,
  setLocation: () => null,

  toggleFavorite: () => null,
  isLoadingFavoriteIds: false,
  favoriteIds: [],
  setFavoriteIds: () => null,
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
  const [[isLoadingGenres, genres], setGenres] = useStorageState<
    { id: string; name: string }[] | null
  >('genres');
  const [isCompilingGenres, setIsCompilingGenres] = useState(false);
  const [[isLoadingLocation, location], setLocation] = useStorageState<{
    lat: number;
    lng: number;
    placeName: string;
  } | null>('location');
  const [[isLoadingFavoriteIds, favoriteIds], setFavoriteIds] =
    useStorageState<string[]>('favoriteConcerts');

  const toggleFavorite = (id: string) => {
    if (favoriteIds && favoriteIds.includes(id)) {
      setFavoriteIds(favoriteIds.filter((favId) => favId !== id));
    } else {
      setFavoriteIds(favoriteIds ? [...favoriteIds, id] : [id]);
    }
  };

  useEffect(() => {
    if (session && !genres) {
      async function getGenres() {
        if (!session) return;
        try {
          setIsCompilingGenres(true);

          const genres = await extractUserPlaylistGenres(session.token.access_token);

          // Mapping Spotify genres to Ticketmaster genres, and removing duplicates
          const mappedGenres = genres
            .slice(0, 10)
            .map((genre) => {
              const genreMapItem = genreMap.find((g) => g.spotify_genres.includes(genre.name));
              if (!genreMapItem) return null;
              return {
                id: genreMapItem.tm_id,
                name: genreMapItem.tm_name,
              };
            })
            .filter((g) => g !== null)
            .filter((g, index, self) => self.findIndex((t) => t.id === g.id) === index);

          setGenres(mappedGenres);
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
          setLocation(null);
        },
        session,
        isLoading,
        genres,
        isLoadingGenres,
        isCompilingGenres,
        isLoadingLocation,
        location,
        setLocation,
        toggleFavorite,
        isLoadingFavoriteIds,
        favoriteIds,
        setFavoriteIds,
      }}>
      {children}
    </AuthContext>
  );
}
