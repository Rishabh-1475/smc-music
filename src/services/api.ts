import CryptoJS from 'crypto-js';
import curatedData from './curatedTracks.json';

export interface Song {
  id: string;
  name: string;
  album: string;
  year: string;
  duration: number | string;
  label: string;
  primaryArtists: string;
  imageUrl: string;
  streamUrl: string;
  language: string;
  // Cross-system compatibility fields
  title?: string;
  audioUrl?: string;
  image?: any;
  hasLyrics?: boolean;
  lyrics?: string;
  [key: string]: any;
}

const decodeHtml = (html: string): string => {
  if (typeof window === 'undefined') return html || '';
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

// Bulletproof Image Extraction Helper handling every schema shape
export const extractRealCover = (item: any): string => {
  if (!item) return '';

  // 1. If it's the standard JioSaavn array of quality objects
  const imgData = item.image || item.images || item.album_image;
  if (Array.isArray(imgData) && imgData.length > 0) {
    // Grab the highest resolution (last element or 500x500)
    const best = imgData[imgData.length - 1];
    const url = typeof best === 'string' ? best : best?.url || best?.link;
    if (url && typeof url === 'string') {
      return url.replace('50x50', '500x500').replace('150x150', '500x500').replace('http://', 'https://');
    }
  }

  // 2. If it's a direct URL string
  if (typeof imgData === 'string' && imgData.startsWith('http')) {
    return imgData.replace('50x50', '500x500').replace('150x150', '500x500').replace('http://', 'https://');
  }

  // 3. Check legacy or alternative mirror keys
  if (typeof item.imageUrl === 'string' && item.imageUrl.startsWith('http')) {
    return item.imageUrl.replace('50x50', '500x500').replace('150x150', '500x500');
  }

  return '';
};

// Extracts highest fidelity audio stream (320kbps -> 160kbps -> 96kbps)
const extractBestStream = (downloadUrls: any, fallbackUrl?: string): string => {
  if (Array.isArray(downloadUrls) && downloadUrls.length > 0) {
    const q320 = downloadUrls.find((u: any) => u.quality === '320kbps' || u.bitrate === '320kbps' || u.quality === '320');
    if (q320?.url || q320?.link) return q320.url || q320.link;

    const q160 = downloadUrls.find((u: any) => u.quality === '160kbps' || u.bitrate === '160kbps' || u.quality === '160');
    if (q160?.url || q160?.link) return q160.url || q160.link;

    const last = downloadUrls[downloadUrls.length - 1];
    return last?.url || last?.link || '';
  }
  return fallbackUrl || '';
};

// Decrypts JioSaavn DES-ECB encrypted media URLs to direct CDN streaming links
export const decryptMediaUrl = (encryptedMediaUrl: string): string => {
  if (!encryptedMediaUrl || typeof encryptedMediaUrl !== 'string') return '';
  try {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedMediaUrl.trim()) },
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    const decryptedUrl = decrypted.toString(CryptoJS.enc.Utf8);
    if (decryptedUrl && decryptedUrl.startsWith('http')) {
      const httpsUrl = decryptedUrl.replace('http://', 'https://');
      return httpsUrl.includes('_96.') ? httpsUrl.replace(/_96\./g, '_320.') : httpsUrl;
    }
  } catch {
    // Fail silently
  }
  return '';
};

// Robust parser handling both raw JioSaavn schemas and community mirror schemas
const parseSongPayload = (item: any): Song | null => {
  if (!item) return null;
  const rawAudio = item.downloadUrl || item.downloadUrls || item.media_urls;
  let streamUrl = extractBestStream(rawAudio, item.media_url);

  // Fallback to official JioSaavn DES-ECB decryption if encrypted_media_url is present
  if (!streamUrl && item.more_info?.encrypted_media_url) {
    streamUrl = decryptMediaUrl(item.more_info.encrypted_media_url);
  }
  if (!streamUrl && typeof item.encrypted_media_url === 'string') {
    streamUrl = decryptMediaUrl(item.encrypted_media_url);
  }

  if (!streamUrl) return null;

  const rawName = item.name || item.title || item.song || 'Unknown Song';
  const name = decodeHtml(rawName);

  const rawArtists =
    item.primaryArtists ||
    item.singers ||
    item.artist ||
    (Array.isArray(item.artists?.primary) ? item.artists.primary.map((a: any) => a.name).join(', ') : '') ||
    (Array.isArray(item.more_info?.artistMap?.primary_artists)
      ? item.more_info.artistMap.primary_artists.map((a: any) => a.name).join(', ')
      : '') ||
    item.more_info?.music ||
    item.subtitle ||
    'Various Artists';

  const album = decodeHtml(item.album?.name || item.more_info?.album || item.album || 'Single');
  const year = String(
    item.year ||
    item.more_info?.release_date?.slice(0, 4) ||
    item.release_date?.slice(0, 4) ||
    '2026'
  );
  const duration = item.duration || item.more_info?.duration || 210;
  const label = item.label || item.more_info?.copyright_text || item.copyright_text || '';
  const coverUrl = extractRealCover(item);

  return {
    id: String(item.id || Math.random()),
    name,
    title: name,
    album,
    year,
    duration,
    label,
    primaryArtists: decodeHtml(rawArtists),
    imageUrl: coverUrl,
    image: coverUrl,
    streamUrl,
    audioUrl: streamUrl,
    language: item.language || 'hindi'
  };
};

export const fetchSongsByQuery = async (query: string, page: number = 1): Promise<Song[]> => {
  if (!query || !query.trim()) return [];

  const cleanQuery = query.trim();

  // Multi-endpoint racing: hits full search endpoints requesting 50 items
  const endpoints = [
    `https://saavn.dev/api/search/songs?query=${encodeURIComponent(cleanQuery)}&page=${page}&limit=50`,
    `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${encodeURIComponent(cleanQuery)}&page=${page}&limit=50`,
    `https://saavn.dev/api/search?query=${encodeURIComponent(cleanQuery)}&page=${page}&limit=50`,
    // Direct Official JioSaavn Multi-Result Engine (returns up to 50 comprehensive tracks across all regions)
    `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=50&p=${page}&q=${encodeURIComponent(cleanQuery)}`
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timeoutId);

      if (!res.ok) continue;

      const data = await res.json();

      // Support results from direct songs search or nested global search or official JioSaavn results
      const rawResults =
        data?.data?.results ||
        data?.results ||
        data?.data?.songs?.results ||
        (Array.isArray(data?.data) ? data.data : []);

      if (Array.isArray(rawResults) && rawResults.length > 0) {
        const parsed = rawResults
          .map(parseSongPayload)
          .filter((song): song is Song => song !== null);

        if (parsed.length > 0) return parsed;
      }
    } catch (err) {
      console.warn(`Query mirror failed for endpoint: ${url}`, err);
    }
  }

  // Fallback to high-res curated pool for offline resilience
  const curatedPool: Song[] = [
    ...(curatedData.quickPicks || []),
    ...(curatedData.trendingHits || []),
    ...(curatedData.punjabiHits || []),
    ...(curatedData.bhojpuriHits || [])
  ].map((t: any) => {
    const cover = extractRealCover(t);
    return {
      id: String(t.id),
      name: decodeHtml(t.name || t.title),
      title: decodeHtml(t.title || t.name),
      album: decodeHtml(t.album || 'Lossless Album'),
      year: String(t.year || '2026'),
      duration: t.duration || 210,
      label: t.label || 'SMC Records',
      primaryArtists: decodeHtml(t.primaryArtists || 'Featured Artist'),
      imageUrl: cover,
      image: cover,
      streamUrl: t.audioUrl || '',
      audioUrl: t.audioUrl || '',
      language: t.language || 'hindi'
    };
  });

  const qLow = cleanQuery.toLowerCase();
  const matched = curatedPool.filter(
    (s) =>
      s.name.toLowerCase().includes(qLow) ||
      s.primaryArtists.toLowerCase().includes(qLow) ||
      s.album.toLowerCase().includes(qLow)
  );

  return matched.length > 0 ? matched : [];
};

export const searchSongs = fetchSongsByQuery;

export const getRadioForTrack = async (song: Song): Promise<Song[]> => {
  const query = song.primaryArtists ? `${song.primaryArtists} Hits` : song.name;
  return fetchSongsByQuery(query, 1);
};

export const getDynamicAutoplayQueue = async (currentTrack: Song): Promise<Song[]> => {
  return getRadioForTrack(currentTrack);
};

export const getLyrics = async (songId: string): Promise<string> => {
  try {
    const res = await fetch(`https://saavn.dev/api/lyrics?id=${songId}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.data?.lyrics) return data.data.lyrics;
    }
  } catch {
    // Fail silently
  }
  return '';
};
