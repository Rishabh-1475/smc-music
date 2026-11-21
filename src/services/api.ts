import CryptoJS from 'crypto-js';

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
  'Latest Punjabi Hits 2026',
  'Arijit Singh Top Tracks',
  'Top Global Viral Songs',
  'Sidhu Moose Wala Hits',
  'Bhojpuri Top Dhamaka 2026'
];

const DES_KEY = CryptoJS.enc.Utf8.parse('38346591');

const decodeHtml = (str: string): string => {
  if (!str) return '';
  if (typeof window !== 'undefined') {
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value;
  }
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
};

export const decryptMediaUrl = (encryptedBase64: string, is320?: boolean | string): string => {
  if (!encryptedBase64) return '';
  try {
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedBase64) },
      DES_KEY,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    let url = decrypted.toString(CryptoJS.enc.Utf8).trim();
    if (!url) return '';
    url = url.replace('http://', 'https://');
    if (is320 === true || is320 === 'true') {
      url = url.replace('_96.', '_320.').replace('_160.', '_320.');
    }
    return url;
  } catch {
    return '';
  }
};

export const extract320Stream = (down: any, fallback?: string): string => {
  if (Array.isArray(down) && down.length > 0) {
    // 1st Priority: 320kbps
    const q320 = down.find(
      (d: any) =>
        d.quality === '320kbps' ||
        d.quality === '320' ||
        d.bitrate === '320kbps' ||
        d.bitrate === '320'
    );
    if (q320?.url || q320?.link) return (q320.url || q320.link).replace('http://', 'https://');

    // 2nd Priority: 160kbps
    const q160 = down.find(
      (d: any) =>
        d.quality === '160kbps' ||
        d.quality === '160' ||
        d.bitrate === '160kbps' ||
        d.bitrate === '160'
    );
    if (q160?.url || q160?.link) return (q160.url || q160.link).replace('http://', 'https://');

    // 3rd Priority: 96kbps / last available
    const q96 = down.find(
      (d: any) =>
        d.quality === '96kbps' ||
        d.quality === '96' ||
        d.bitrate === '96kbps' ||
        d.bitrate === '96'
    );
    if (q96?.url || q96?.link) return (q96.url || q96.link).replace('http://', 'https://');

    const last = down[down.length - 1];
    if (last?.url || last?.link) return (last.url || last.link).replace('http://', 'https://');
  }
  return (fallback || '').replace('http://', 'https://');
};

export const extract500Image = (img: any): string => {
  if (Array.isArray(img) && img.length > 0) {
    const highest = img[img.length - 1];
    const u = typeof highest === 'string' ? highest : highest?.url || highest?.link || '';
    if (u) return u.replace('50x50', '500x500').replace('150x150', '500x500').replace('http://', 'https://');
  }
  if (typeof img === 'string' && img.startsWith('http')) {
    return img.replace('50x50', '500x500').replace('150x150', '500x500').replace('http://', 'https://');
  }
  return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
};

const extractArtists = (item: any): string => {
  if (Array.isArray(item.artists?.primary) && item.artists.primary.length > 0) {
    return item.artists.primary.map((a: any) => a.name).join(', ');
  }
  if (item.primaryArtists) return item.primaryArtists;
  if (item.singers) return item.singers;
  if (item.artist) return item.artist;
  if (item.more_info?.artistMap?.primary_artists?.length > 0) {
    return item.more_info.artistMap.primary_artists.map((a: any) => a.name).join(', ');
  }
  if (item.more_info?.singers) return item.more_info.singers;
  return 'Various Artists';
};

const fetchMirrorWithTimeout = async (url: string, timeoutMs = 8000): Promise<Song[]> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rawList =
      data?.data?.results ||
      data?.results ||
      (Array.isArray(data?.data) ? data.data : []);

    if (!Array.isArray(rawList) || rawList.length === 0) {
      throw new Error('Empty results');
    }

    const parsed: Song[] = rawList
      .map((item: any) => {
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
          primaryArtists: decodeHtml(extractArtists(item)),
          imageUrl: extract500Image(item.image || item.images),
          streamUrl,
          language: item.language || 'hindi'
        };
      })
      .filter((s: Song) => Boolean(s.streamUrl && s.imageUrl));

    if (parsed.length === 0) throw new Error('No valid playable songs');
    return parsed;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

const fetchDirectJioSaavn = async (query: string, timeoutMs = 8000): Promise<Song[]> => {
  const clean = encodeURIComponent(query);
  const target = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=40&p=1&q=${clean}`;

  const endpoints = [
    target,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`
  ];

  for (const url of endpoints) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      if (!res.ok) continue;
      const text = await res.text();
      const data = JSON.parse(text);
      const rawList = data?.results || (Array.isArray(data) ? data : []);
      if (!Array.isArray(rawList) || rawList.length === 0) continue;

      const parsed: Song[] = rawList
        .map((item: any) => {
          const encUrl = item.more_info?.encrypted_media_url || item.encrypted_media_url;
          const is320 = item.more_info?.['320kbps'] ?? item['320kbps'];
          let streamUrl = decryptMediaUrl(encUrl, is320);
          if (!streamUrl && item.media_url) {
            streamUrl = item.media_url.replace('http://', 'https://');
          }

          const rawDuration = item.more_info?.duration || item.duration;
          const duration = Number(rawDuration) || 210;

          return {
            id: String(item.id || Math.random().toString(36).substring(2, 9)),
            name: decodeHtml(item.title || item.song || item.name || 'Master Track'),
            album: decodeHtml(item.more_info?.album || item.album || 'Single'),
            year: String(item.year || '2026'),
            duration,
            label: item.more_info?.copyright_text || item.label || 'JioSaavn',
            primaryArtists: decodeHtml(extractArtists(item)),
            imageUrl: extract500Image(item.image || item.images),
            streamUrl,
            language: item.language || 'hindi'
          };
        })
        .filter((s: Song) => Boolean(s.streamUrl && s.imageUrl));

      if (parsed.length > 0) return parsed;
    } catch {
      clearTimeout(id);
    }
  }
  return [];
};

export const fetchSongsByQuery = async (query: string): Promise<Song[]> => {
  const effectiveQuery = (!query || !query.trim())
    ? LIVE_SEED_QUERIES[Math.floor(Math.random() * LIVE_SEED_QUERIES.length)]
    : query.trim();

  const clean = encodeURIComponent(effectiveQuery);

  // Live verified JioSaavn mirror endpoints (tested HTTP 200 with CORS: *)
  const mirrorEndpoints = [
    `https://saavnapi-beta.vercel.app/search/songs?query=${clean}&page=1&limit=40`,
    `https://saavn-api-one.vercel.app/search/songs?query=${clean}&page=1&limit=40`
  ];

  // Race working mirrors in parallel with Promise.any
  try {
    const results = await Promise.any(
      mirrorEndpoints.map((url) => fetchMirrorWithTimeout(url, 8000))
    );
    if (results && results.length > 0) {
      return results;
    }
  } catch {
    // Both mirrors failed or timed out, attempt direct JioSaavn fallback
  }

  // Direct JioSaavn api.php + pure-JS DES-ECB decryption fallback
  try {
    const directResults = await fetchDirectJioSaavn(effectiveQuery, 8000);
    if (directResults && directResults.length > 0) {
      return directResults;
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
  const chosenQueries = queries.sort(() => 0.5 - Math.random()).slice(0, 2);

  const settled = await Promise.allSettled(
    chosenQueries.map((q) => fetchSongsByQuery(q))
  );

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

    // Strict non-repeat check: reject songs with >50% word overlap with current track
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

  // Fisher-Yates Shuffle for diverse playback
  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
  }

  return filtered;
};

export const fetchRadioRecommendations = fetchDynamicRadioQueue;
export const fetchDynamicRadio = fetchDynamicRadioQueue;
