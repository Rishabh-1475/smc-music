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
  title?: string;
  audioUrl?: string;
  image?: any;
  hasLyrics?: boolean;
  lyrics?: string;
  [key: string]: any;
}

// Built-in resilient catalog so the app NEVER renders blank
export const DEFAULT_FALLBACK_TRACKS: Song[] = [
  {
    id: "fb_1",
    name: "Tu Mil Jaaye (From \"KING\")",
    album: "KING",
    year: "2026",
    duration: "215",
    label: "Singh Music",
    primaryArtists: "Sachin-Jigar, Ed Sheeran, Arijit Singh",
    imageUrl: "https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg",
    streamUrl: "https://aac.saavncdn.com/978/f7c1348a47eb9e2b109b8d2eb45a76fa_320.mp4",
    audioUrl: "https://aac.saavncdn.com/978/f7c1348a47eb9e2b109b8d2eb45a76fa_320.mp4",
    language: "hindi"
  },
  {
    id: "fb_2",
    name: "295",
    album: "Moosetape",
    year: "2021",
    duration: "270",
    label: "Sidhu Moose Wala",
    primaryArtists: "Sidhu Moose Wala",
    imageUrl: "https://c.saavncdn.com/026/Moosetape-Punjabi-2021-20210514130005-500x500.jpg",
    streamUrl: "https://aac.saavncdn.com/026/8a3ebc6e2d04b9e8c14a0a3e59ad1a28_320.mp4",
    audioUrl: "https://aac.saavncdn.com/026/8a3ebc6e2d04b9e8c14a0a3e59ad1a28_320.mp4",
    language: "punjabi"
  },
  {
    id: "fb_3",
    name: "Lollipop Lagelu",
    album: "Lollipop Lagelu",
    year: "2015",
    duration: "240",
    label: "Wave Music",
    primaryArtists: "Pawan Singh",
    imageUrl: "https://c.saavncdn.com/495/Lollipop-Lagelu-Bhojpuri-2015-500x500.jpg",
    streamUrl: "https://aac.saavncdn.com/495/d94bc17e1f8e7e8bfb5e8cc4a0a0d5c5_320.mp4",
    audioUrl: "https://aac.saavncdn.com/495/d94bc17e1f8e7e8bfb5e8cc4a0a0d5c5_320.mp4",
    language: "bhojpuri"
  },
  {
    id: "fb_4",
    name: "Murder In My Mind",
    album: "Murder In My Mind",
    year: "2022",
    duration: "145",
    label: "KORDHELL",
    primaryArtists: "KORDHELL",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80",
    streamUrl: "",
    audioUrl: "",
    language: "english"
  },
  {
    id: "fb_5",
    name: "Apna Bana Le",
    album: "Bhediya",
    year: "2022",
    duration: "261",
    label: "Zee Music",
    primaryArtists: "Arijit Singh, Sachin-Jigar",
    imageUrl: "https://c.saavncdn.com/815/Bhediya-Hindi-2023-20230927155213-500x500.jpg",
    streamUrl: "https://aac.saavncdn.com/675/1456dc2903d0fb4465d2d2904008803b_320.mp4",
    audioUrl: "https://aac.saavncdn.com/675/1456dc2903d0fb4465d2d2904008803b_320.mp4",
    language: "hindi"
  }
];

const decodeHtml = (html: string): string => {
  if (typeof window === 'undefined') return html || '';
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

export const extractRealCover = (item: any): string => {
  if (!item) return '';
  const imgData = item.image || item.images || item.album_image;
  if (Array.isArray(imgData) && imgData.length > 0) {
    const best = imgData[imgData.length - 1];
    const url = typeof best === 'string' ? best : best?.url || best?.link;
    if (url && typeof url === 'string') {
      return url.replace('50x50', '500x500').replace('150x150', '500x500').replace('http://', 'https://');
    }
  }
  if (typeof imgData === 'string' && imgData.startsWith('http')) {
    return imgData.replace('50x50', '500x500').replace('150x150', '500x500').replace('http://', 'https://');
  }
  if (typeof item.imageUrl === 'string' && item.imageUrl.startsWith('http')) {
    return item.imageUrl.replace('50x50', '500x500').replace('150x150', '500x500');
  }
  return '';
};

const extractBestStream = (downloadUrls: any, fallback?: string): string => {
  if (Array.isArray(downloadUrls) && downloadUrls.length > 0) {
    const q320 = downloadUrls.find((u: any) => u.quality === '320kbps' || u.bitrate === '320kbps' || u.quality === '320');
    if (q320?.url || q320?.link) return q320.url || q320.link;
    const q160 = downloadUrls.find((u: any) => u.quality === '160kbps' || u.bitrate === '160kbps' || u.quality === '160');
    if (q160?.url || q160?.link) return q160.url || q160.link;
    const last = downloadUrls[downloadUrls.length - 1];
    return last?.url || last?.link || '';
  }
  return fallback || '';
};

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
    // silent
  }
  return '';
};

const parseSongPayload = (item: any): Song | null => {
  if (!item) return null;
  const rawAudio = item.downloadUrl || item.downloadUrls || item.media_urls;
  let streamUrl = extractBestStream(rawAudio, item.media_url);
  if (!streamUrl && item.more_info?.encrypted_media_url) {
    streamUrl = decryptMediaUrl(item.more_info.encrypted_media_url);
  }
  if (!streamUrl && typeof item.encrypted_media_url === 'string') {
    streamUrl = decryptMediaUrl(item.encrypted_media_url);
  }
  if (!streamUrl) return null;

  const name = decodeHtml(item.name || item.title || item.song || 'Unknown Song');
  const coverUrl = extractRealCover(item);
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

  return {
    id: String(item.id || Math.random()),
    name,
    title: name,
    album: decodeHtml(item.album?.name || item.more_info?.album || item.album || 'Single'),
    year: String(item.year || item.more_info?.release_date?.slice(0, 4) || '2026'),
    duration: item.duration || item.more_info?.duration || 210,
    label: item.label || item.more_info?.copyright_text || '',
    primaryArtists: decodeHtml(rawArtists),
    imageUrl: coverUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
    image: coverUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
    streamUrl,
    audioUrl: streamUrl,
    language: item.language || 'hindi'
  };
};

export const fetchSongsByQuery = async (query: string, page: number = 1): Promise<Song[]> => {
  if (!query || !query.trim()) return DEFAULT_FALLBACK_TRACKS;

  const cleanQuery = query.trim();
  const endpoints = [
    `https://saavn.dev/api/search/songs?query=${encodeURIComponent(cleanQuery)}&page=${page}&limit=30`,
    `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${encodeURIComponent(cleanQuery)}&page=${page}&limit=30`,
    `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=30&p=${page}&q=${encodeURIComponent(cleanQuery)}`
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);
      const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timeoutId);
      if (!res.ok) continue;

      const data = await res.json();
      const rawResults =
        data?.data?.results ||
        data?.results ||
        data?.data?.songs?.results ||
        (Array.isArray(data?.data) ? data.data : []);

      if (Array.isArray(rawResults) && rawResults.length > 0) {
        const parsed = rawResults.map(parseSongPayload).filter((s): s is Song => s !== null);
        if (parsed.length > 0) return parsed;
      }
    } catch {
      // continue to next mirror
    }
  }

  // Curated fallback from local JSON
  const curatedPool: Song[] = [
    ...(curatedData.quickPicks || []),
    ...(curatedData.trendingHits || []),
    ...(curatedData.punjabiHits || []),
    ...(curatedData.bhojpuriHits || [])
  ].map((t: any) => {
    const cover = extractRealCover(t) || t.imageUrl || '';
    return {
      id: String(t.id),
      name: decodeHtml(t.name || t.title),
      title: decodeHtml(t.title || t.name),
      album: decodeHtml(t.album || 'Album'),
      year: String(t.year || '2026'),
      duration: t.duration || 210,
      label: t.label || '',
      primaryArtists: decodeHtml(t.primaryArtists || 'Artist'),
      imageUrl: cover,
      image: cover,
      streamUrl: t.audioUrl || '',
      audioUrl: t.audioUrl || '',
      language: t.language || 'hindi'
    };
  }).filter((s) => s.streamUrl);

  if (curatedPool.length > 0) return curatedPool;

  return DEFAULT_FALLBACK_TRACKS;
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
  } catch { /* silent */ }
  return '';
};
