interface GenreCount {
  name: string;
  count: number;
}

async function extractUserPlaylistGenres(accessToken: string): Promise<GenreCount[]> {
  try {
    // Step 1: Get user's last 5 playlists
    const playlists = await getUserPlaylists(accessToken);

    // Step 2: Extract all genres from all playlists
    const genreCount = new Map<string, number>();

    for (const playlist of playlists) {
      const tracks = await getAllPlaylistTracks(accessToken, playlist.id);
      const artistIds = getUniqueArtistIds(tracks);
      const artists = await getArtistDetails(accessToken, artistIds);

      // Count genres from this playlist
      artists.forEach((artist: { [key: string]: any }) => {
        if (artist.genres && Array.isArray(artist.genres)) {
          artist.genres.forEach((genre: string) => {
            genreCount.set(genre, (genreCount.get(genre) || 0) + 1);
          });
        }
      });
    }

    // Step 3: Convert to sorted array
    const sortedGenres: GenreCount[] = Array.from(genreCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return sortedGenres;
  } catch (error) {
    throw new Error(
      `Failed to extract genres: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

async function getUserPlaylists(accessToken: string): Promise<{ [key: string]: any }[]> {
  const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=10&offset=0', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch playlists: ${response.status} ${response.statusText}`);
  }

  const data: { [key: string]: any } = await response.json();
  return data.items || [];
}

async function getAllPlaylistTracks(
  accessToken: string,
  playlistId: string
): Promise<{ [key: string]: any }[]> {
  const allTracks: { [key: string]: any }[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}&limit=${limit}&fields=items(track(artists(id))),next`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn(`Failed to fetch tracks for playlist ${playlistId}: ${response.status}`);
      break;
    }

    const data: { [key: string]: any } = await response.json();
    const items = data.items || [];

    // Filter valid tracks
    const validTracks = items.filter(
      (item: { [key: string]: any }) =>
        item.track && item.track.artists && Array.isArray(item.track.artists)
    );

    allTracks.push(...validTracks);

    if (!data.next || items.length < limit) {
      break;
    }

    offset += limit;
  }

  return allTracks;
}

function getUniqueArtistIds(tracks: { [key: string]: any }[]): string[] {
  const artistIds = new Set<string>();

  tracks.forEach((item: { [key: string]: any }) => {
    if (item.track && item.track.artists) {
      item.track.artists.forEach((artist: { [key: string]: any }) => {
        if (artist.id) {
          artistIds.add(artist.id);
        }
      });
    }
  });

  return Array.from(artistIds);
}

async function getArtistDetails(
  accessToken: string,
  artistIds: string[]
): Promise<{ [key: string]: any }[]> {
  const allArtists: { [key: string]: any }[] = [];
  const batchSize = 50;

  for (let i = 0; i < artistIds.length; i += batchSize) {
    const batch = artistIds.slice(i, i + batchSize);

    try {
      const response = await fetch(`https://api.spotify.com/v1/artists?ids=${batch.join(',')}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`Failed to fetch artist batch: ${response.status}`);
        continue;
      }

      const data: { [key: string]: any } = await response.json();
      const artists = data.artists || [];

      // Filter out null artists
      const validArtists = artists.filter((artist: { [key: string]: any }) => artist !== null);
      allArtists.push(...validArtists);
    } catch (error) {
      console.warn(`Error fetching artist batch:`, error);
    }

    // Rate limiting delay
    if (i + batchSize < artistIds.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return allArtists;
}

export { extractUserPlaylistGenres, type GenreCount };
