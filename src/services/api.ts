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

export const BACKUP_SONGS: Song[] = [
  {
    id: "bk_1",
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
    id: "bk_2",
    name: "Kalyani (Remix)",
    album: "Kalyani",
    year: "2026",
    duration: "201",
    label: "Singh Music",
    primaryArtists: "ARJN, KDS, FIFTY4, Shreya Ghoshal",
    imageUrl: "https://c.saavncdn.com/475/KALYANI-Remix-Malayalam-2026-20260622131127-500x500.jpg",
    streamUrl: "https://aac.saavncdn.com/475/TwAeSigUBFmoRG0TK4kYR_320.mp4",
    language: "hindi"
  },
  {
    id: "bk_3",
    name: "295",
    album: "Moosetape",
    year: "2021",
    duration: "270",
    label: "Sidhu Moose Wala",
    primaryArtists: "Sidhu Moose Wala",
    imageUrl: "https://c.saavncdn.com/026/Moosetape-Punjabi-2021-20210514130005-500x500.jpg",
    streamUrl: "https://aac.saavncdn.com/026/8a3ebc6e2d04b9e8c14a0a3e59ad1a28_320.mp4",
    language: "punjabi"
  },
  {
    id: "bk_4",
    name: "Apna Bana Le",
    album: "Bhediya",
    year: "2022",
    duration: "261",
    label: "Zee Music",
    primaryArtists: "Arijit Singh, Sachin-Jigar",
    imageUrl: "https://c.saavncdn.com/815/Bhediya-Hindi-2023-20230927155213-500x500.jpg",
    streamUrl: "https://aac.saavncdn.com/675/1456dc2903d0fb4465d2d2904008803b_320.mp4",
    language: "hindi"
  },
  {
    id: "bk_5",
    name: "Lollipop Lagelu",
    album: "Superhit Bhojpuri",
    year: "2015",
    duration: "240",
    label: "Wave Music",
    primaryArtists: "Pawan Singh",
    imageUrl: "https://c.saavncdn.com/495/Lollipop-Lagelu-Bhojpuri-2015-500x500.jpg",
    streamUrl: "https://aac.saavncdn.com/495/d94bc17e1f8e7e8bfb5e8cc4a0a0d5c5_320.mp4",
    language: "bhojpuri"
  },
  {
    id: "bk_6",
    name: "Blinding Lights",
    album: "The Highlights",
    year: "2020",
    duration: "200",
    label: "Republic Records",
    primaryArtists: "The Weeknd",
    imageUrl: "https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.jpg",
    streamUrl: "https://aac.saavncdn.com/179/ee99b14844e2699aad400fa1e946c0ed_320.mp4",
    language: "english"
  },
  {
    id: "bk_7",
    name: "Labon Ko",
    album: "Bhool Bhulaiyaa",
    year: "2007",
    duration: "341",
    label: "T-Series",
    primaryArtists: "KK, Pritam",
    imageUrl: "https://c.saavncdn.com/056/Bhool-Bhulaiyaa-Hindi-2007-20241223151003-500x500.jpg",
    streamUrl: "https://aac.saavncdn.com/675/1456dc2903d0fb4465d2d2904008803b_320.mp4",
    language: "hindi"
  },
  {
    id: "bk_8",
    name: "Tum Hi Ho",
    album: "Aashiqui 2",
    year: "2013",
    duration: "262",
    label: "T-Series",
    primaryArtists: "Mithoon, Arijit Singh",
    imageUrl: "https://c.saavncdn.com/430/Aashiqui-2-Hindi-2013-500x500.jpg",
    streamUrl: "https://aac.saavncdn.com/430/2LOBgFbPNFEPLtUR1p7SaTBSm47kY9OJLK2_320.mp4",
    language: "hindi"
  }
];

export const DEFAULT_FALLBACK_TRACKS = BACKUP_SONGS;

export const decodeHtml = (str: string): string => {
  if (typeof window === 'undefined') return str || '';
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
};

export const extractRealCover = (img: any): string => {
  if (!img) return 'https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg';

  if (Array.isArray(img) && img.length > 0) {
    const last = img[img.length - 1];
    const u = typeof last === 'string' ? last : last?.url || last?.link || '';
    if (u && typeof u === 'string') {
      return u.replace('50x50', '500x500').replace('150x150', '500x500').replace('http://', 'https://');
    }
  }

  if (typeof img === 'string' && img.startsWith('http')) {
    return img.replace('50x50', '500x500').replace('150x150', '500x500').replace('http://', 'https://');
  }

  if (typeof img === 'object') {
    const u = img.url || img.link || img.imageUrl || '';
    if (u && typeof u === 'string') {
      return u.replace('50x50', '500x500').replace('150x150', '500x500').replace('http://', 'https://');
    }
  }

  return 'https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg';
};

const extractCover = extractRealCover;

const extractStream = (down: any, fallback?: string): string => {
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
  if (!query || !query.trim()) return BACKUP_SONGS;

  const cleanQuery = encodeURIComponent(query.trim());
  const mirrors = [
    `https://saavnapi-beta.vercel.app/search/songs?query=${cleanQuery}&page=1&limit=40`,
    `https://jiosaavn-api.vercel.app/search?query=${cleanQuery}`,
    `https://saavn.dev/api/search/songs?query=${cleanQuery}&page=1&limit=40`,
    `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${cleanQuery}&page=1&limit=40`
  ];

  for (const mirror of mirrors) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(mirror, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) continue;
      const data = await res.json();
      const list = data?.data?.results || data?.results || (Array.isArray(data?.data) ? data.data : []);

      if (Array.isArray(list) && list.length > 0) {
        const parsed = list.map((item: any) => {
          const rawAudio = item.downloadUrl || item.downloadUrls || item.media_urls;
          const streamUrl = extractStream(rawAudio, item.media_url);
          const rawImg = item.image || item.images || item.album_image;
          const imageUrl = extractRealCover(rawImg);
          const name = decodeHtml(item.name || item.title || item.song || 'Song');

          return {
            id: String(item.id || Math.random()),
            name,
            title: name,
            album: decodeHtml(item.album?.name || item.album || 'Single'),
            year: String(item.year || '2026'),
            duration: item.duration || '210',
            label: item.label || '',
            primaryArtists: decodeHtml(item.primaryArtists || item.singers || item.artist || 'Various Artists'),
            imageUrl,
            image: imageUrl,
            streamUrl,
            audioUrl: streamUrl,
            language: item.language || 'hindi'
          };
        }).filter((s: Song) => s.streamUrl && s.imageUrl);

        if (parsed.length > 0) return parsed;
      }
    } catch {
      // try next mirror
    }
  }

  return BACKUP_SONGS;
};

export const searchSongs = fetchSongsByQuery;
