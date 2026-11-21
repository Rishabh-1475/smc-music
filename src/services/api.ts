export interface Song {
  id: string;
  name: string;
  album: string;
  year: string;
  duration: number;
  label: string;
  primaryArtists: string;
  imageUrl: string;
  streamUrl: string;
  language: string;
}

export const LIVE_SEED_QUERIES = [
  'Trending Bollywood Hits 2026',
  'Latest Punjabi Hits',
  'Arijit Singh Top Tracks',
  'Top Global Viral Songs',
  'Sidhu Moose Wala Hits',
  'Bhojpuri Top Dhamaka 2026'
];

const decodeHtml = (str: string): string => {
  if (typeof window === 'undefined') return str || '';
  const txt = document.createElement('textarea');
  txt.innerHTML = str || '';
  return txt.value;
};

export const extract320Stream = (down: any, fallback?: string): string => {
  if (Array.isArray(down) && down.length > 0) {
    const q320 = down.find(
      (d: any) =>
        d.quality === '320kbps' ||
        d.quality === '320' ||
        d.bitrate === '320kbps' ||
        d.bitrate === '320'
    );
    if (q320?.url || q320?.link) return (q320.url || q320.link).replace('http://', 'https://');

    const q160 = down.find(
      (d: any) =>
        d.quality === '160kbps' ||
        d.quality === '160' ||
        d.bitrate === '160kbps' ||
        d.bitrate === '160'
    );
    if (q160?.url || q160?.link) return (q160.url || q160.link).replace('http://', 'https://');

    const last = down[down.length - 1];
    if (last?.url || last?.link) return (last.url || last.link).replace('http://', 'https://');
  }
  return (fallback || '').replace('http://', 'https://');
};

export const extract500Image = (img: any): string => {
  if (Array.isArray(img) && img.length > 0) {
    const highest = img[img.length - 1];
    const u = typeof highest === 'string' ? highest : highest?.url || highest?.link || '';
    if (u) return u.replace('50x50', '500x500').replace('150x150', '500x500');
  }
  if (typeof img === 'string' && img.startsWith('http')) {
    return img.replace('50x50', '500x500').replace('150x150', '500x500');
  }
  return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
};

const fetchWithTimeout = async (url: string, timeoutMs = 6000): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

export const fetchSongsByQuery = async (query: string): Promise<Song[]> => {
  const effectiveQuery = (!query || !query.trim())
    ? LIVE_SEED_QUERIES[Math.floor(Math.random() * LIVE_SEED_QUERIES.length)]
    : query.trim();

  const clean = encodeURIComponent(effectiveQuery);

  const saavnEndpoints = [
    `https://saavn.dev/api/search/songs?query=${clean}&page=1&limit=40`,
    `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${clean}&page=1&limit=40`,
    `https://saavn-api-sigma.vercel.app/api/search/songs?query=${clean}&page=1&limit=40`
  ];

  for (const url of saavnEndpoints) {
    try {
      const res = await fetchWithTimeout(url, 6000);
      if (!res.ok) continue;
      const data = await res.json();
      const rawList =
        data?.data?.results ||
        data?.results ||
        (Array.isArray(data?.data) ? data.data : []);

      if (Array.isArray(rawList) && rawList.length > 0) {
        const parsed: Song[] = rawList
          .map((item: any) => {
            let primaryArtists = 'Various Artists';
            if (Array.isArray(item.artists?.primary) && item.artists.primary.length > 0) {
              primaryArtists = item.artists.primary.map((a: any) => a.name).join(', ');
            } else if (item.primaryArtists) {
              primaryArtists = item.primaryArtists;
            } else if (item.singers) {
              primaryArtists = item.singers;
            } else if (item.artist) {
              primaryArtists = item.artist;
            }

            const streamUrl = extract320Stream(
              item.downloadUrl || item.downloadUrls,
              item.media_url
            );

            return {
              id: String(item.id || Math.random().toString(36).substring(2, 9)),
              name: decodeHtml(item.name || item.title || item.song || 'Master Audio Track'),
              album: decodeHtml(item.album?.name || item.album || 'Single'),
              year: String(item.year || '2026'),
              duration: Number(item.duration) || 210,
              label: item.label || 'Singh Music Co.',
              primaryArtists: decodeHtml(primaryArtists),
              imageUrl: extract500Image(item.image || item.images),
              streamUrl,
              language: item.language || 'hindi'
            };
          })
          .filter((s: Song) => Boolean(s.streamUrl && s.imageUrl));

        if (parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
  }

  // Fallback to iTunes API
  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${clean}&media=music&limit=25`;
    const res = await fetchWithTimeout(itunesUrl, 6000);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.results) && data.results.length > 0) {
        return data.results
          .filter((item: any) => Boolean(item.previewUrl))
          .map((item: any) => ({
            id: String(item.trackId || Math.random().toString(36).substring(2, 9)),
            name: decodeHtml(item.trackName || 'Master Track'),
            album: decodeHtml(item.collectionName || 'Single'),
            year: item.releaseDate ? item.releaseDate.substring(0, 4) : '2026',
            duration: Math.round((item.trackTimeMillis || 210000) / 1000),
            label: 'Apple Music Preview',
            primaryArtists: decodeHtml(item.artistName || 'Unknown Artist'),
            imageUrl: (item.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
            streamUrl: (item.previewUrl || '').replace('http://', 'https://'),
            language: 'english'
          }));
      }
    }
  } catch {}

  return [];
};

export const fetchDynamicRadioQueue = async (
  current: Song,
  playedIds: string[] = []
): Promise<Song[]> => {
  const leadArtist = (current.primaryArtists || 'Arijit Singh')
    .split(',')[0]
    .replace(/feat\..*$/i, '')
    .trim();

  const queries = [
    `${leadArtist} Hits`,
    `${leadArtist} New Songs 2026`,
    `Trending ${current.language || 'Hindi'} Songs 2026`,
    `Viral Indian Music 2026`
  ];

  // Pick 2 queries at random
  const shuffledQueries = queries.sort(() => 0.5 - Math.random()).slice(0, 2);

  const fetchPromises = shuffledQueries.map((q) => fetchSongsByQuery(q));
  const settled = await Promise.allSettled(fetchPromises);

  const merged: Song[] = [];
  for (const s of settled) {
    if (s.status === 'fulfilled' && Array.isArray(s.value)) {
      merged.push(...s.value);
    }
  }

  const playedSet = new Set([current.id, ...playedIds]);
  const seenIds = new Set<string>();
  const currentTokens = new Set(
    current.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean)
  );

  const filtered = merged.filter((song) => {
    if (seenIds.has(song.id) || playedSet.has(song.id)) return false;
    seenIds.add(song.id);

    // Title overlap check (>50% word overlap rejection)
    const songTokens = song.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
    if (songTokens.length > 0 && currentTokens.size > 0) {
      let overlap = 0;
      for (const t of songTokens) {
        if (currentTokens.has(t)) overlap++;
      }
      const overlapRatio = overlap / Math.max(songTokens.length, currentTokens.size);
      if (overlapRatio > 0.5) return false;
    }
    return true;
  });

  // Fisher-Yates Shuffle
  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
  }

  return filtered;
};

export const fetchRadioRecommendations = fetchDynamicRadioQueue;
export const fetchDynamicRadio = fetchDynamicRadioQueue;
