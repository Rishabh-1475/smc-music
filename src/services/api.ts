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
  [key: string]: any;
}

export const FALLBACK_CATALOG: Song[] = [
  {
    id: "sp_1",
    name: "Tu Mil Jaaye (From \"KING\")",
    album: "KING",
    year: "2026",
    duration: "215",
    label: "Singh Music",
    primaryArtists: "Sachin-Jigar, Ed Sheeran, Arijit Singh",
    imageUrl: "https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg",
    streamUrl: "https://aac.saavncdn.com/978/f7c1348a47eb9e2b109b8d2eb45a76fa_320.mp4",
    language: "hindi"
  },
  {
    id: "sp_2",
    name: "295",
    album: "Moosetape",
    year: "2021",
    duration: "270",
    label: "Sidhu Moose Wala",
    primaryArtists: "Sidhu Moose Wala",
    imageUrl: "https://c.saavncdn.com/026/Moosetape-Punjabi-2021-20210514130005-500x500.jpg",
    streamUrl: "https://aac.saavncdn.com/026/295-Moosetape-320.mp4",
    language: "punjabi"
  },
  {
    id: "sp_3",
    name: "Lollipop Lagelu",
    album: "Superhit Bhojpuri",
    year: "2015",
    duration: "240",
    label: "Wave Music",
    primaryArtists: "Pawan Singh",
    imageUrl: "https://c.saavncdn.com/495/Lollipop-Lagelu-Bhojpuri-2015-500x500.jpg",
    streamUrl: "https://aac.saavncdn.com/495/Lollipop-Lagelu-320.mp4",
    language: "bhojpuri"
  },
  {
    id: "sp_4",
    name: "Apna Bana Le",
    album: "Bhediya",
    year: "2022",
    duration: "261",
    label: "Zee Music",
    primaryArtists: "Arijit Singh, Sachin-Jigar",
    imageUrl: "https://c.saavncdn.com/815/Bhediya-Hindi-2022-20221124110842-500x500.jpg",
    streamUrl: "https://aac.saavncdn.com/815/Apna-Bana-Le-320.mp4",
    language: "hindi"
  },
  {
    id: "sp_5",
    name: "Gehra Hua",
    album: "Dhurandhar",
    year: "2025",
    duration: "198",
    label: "T-Series",
    primaryArtists: "Shashwat Sachdev, Arijit Singh",
    imageUrl: "https://c.saavncdn.com/450/Gehra-Hua-From-Dhurandhar-Hindi-2025-20251205154217-500x500.jpg",
    streamUrl: "https://aac.saavncdn.com/450/fbkJws0PfUuV6q6J9ejr8RC0xbeonCIF_320.mp4",
    language: "hindi"
  }
];

export const BACKUP_SONGS = FALLBACK_CATALOG;
export const DEFAULT_FALLBACK_TRACKS = FALLBACK_CATALOG;

const decodeText = (str: string): string => {
  if (typeof window === 'undefined') return str || '';
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
};

export const decodeHtml = decodeText;

const extractBestImage = (item: any): string => {
  const images = item.image || item.images || item.album_image;
  if (Array.isArray(images) && images.length > 0) {
    const highest = images[images.length - 1];
    const url = typeof highest === 'string' ? highest : highest?.url || highest?.link || '';
    if (url) return url.replace('50x50', '500x500').replace('150x150', '500x500').replace('http://', 'https://');
  }
  if (typeof images === 'string' && images.startsWith('http')) {
    return images.replace('50x50', '500x500').replace('150x150', '500x500').replace('http://', 'https://');
  }
  if (item.imageUrl && typeof item.imageUrl === 'string') {
    return item.imageUrl.replace('50x50', '500x500').replace('150x150', '500x500').replace('http://', 'https://');
  }
  return 'https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg';
};

export const extractRealCover = extractBestImage;

const extractBestStream = (down: any, fallback?: string): string => {
  if (Array.isArray(down) && down.length > 0) {
    const q320 = down.find((d: any) => d.quality === '320kbps' || d.bitrate === '320kbps' || d.quality === '320');
    if (q320?.url || q320?.link) return (q320.url || q320.link).replace('http://', 'https://');
    const q160 = down.find((d: any) => d.quality === '160kbps' || d.bitrate === '160kbps' || d.quality === '160');
    if (q160?.url || q160?.link) return (q160.url || q160.link).replace('http://', 'https://');
    const last = down[down.length - 1];
    const u = last?.url || last?.link || '';
    if (u) return u.replace('http://', 'https://');
  }
  return fallback ? fallback.replace('http://', 'https://') : '';
};

export const fetchSongsByQuery = async (query: string): Promise<Song[]> => {
  if (!query || !query.trim()) return FALLBACK_CATALOG;

  const clean = encodeURIComponent(query.trim());
  const mirrors = [
    `https://saavnapi-beta.vercel.app/search/songs?query=${clean}&page=1&limit=40`,
    `https://jiosaavn-api.vercel.app/search?query=${clean}`,
    `https://saavn.dev/api/search/songs?query=${clean}&page=1&limit=40`,
    `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${clean}&page=1&limit=40`
  ];

  for (const url of mirrors) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) continue;
      const data = await res.json();
      const rawList = data?.data?.results || data?.results || (Array.isArray(data?.data) ? data.data : []);

      if (Array.isArray(rawList) && rawList.length > 0) {
        const parsed = rawList.map((item: any) => ({
          id: String(item.id || Math.random()),
          name: decodeText(item.name || item.title || item.song || 'Unknown Song'),
          album: decodeText(item.album?.name || item.album || 'Single'),
          year: String(item.year || '2026'),
          duration: item.duration || '210',
          label: item.label || '',
          primaryArtists: decodeText(item.primaryArtists || item.singers || item.artist || 'Various Artists'),
          imageUrl: extractBestImage(item),
          streamUrl: extractBestStream(item.downloadUrl || item.downloadUrls, item.media_url),
          language: item.language || 'hindi'
        })).filter((s: Song) => s.streamUrl && s.imageUrl);

        if (parsed.length > 0) return parsed;
      }
    } catch {
      // try next
    }
  }

  return FALLBACK_CATALOG;
};

export const searchSongs = fetchSongsByQuery;
