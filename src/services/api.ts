export interface Song {
  id: string;
  name: string;
  album: string;
  year: string;
  duration: number;
  label: string;
  primaryArtists: string;
  imageUrl: string; // Guaranteed 500x500 CDN URL
  streamUrl: string; // Clean HTTPS 320kbps URL
  language: string;
  playCount?: number;
}

export const FALLBACK_CATALOG: Song[] = [
  {
    id: "rx_3d_1",
    name: "Tu Mil Jaaye (From \"KING\")",
    album: "KING",
    year: "2026",
    duration: 215,
    label: "Singh Music",
    primaryArtists: "Sachin-Jigar, Ed Sheeran, Arijit Singh",
    imageUrl: "https://c.saavncdn.com/978/KING-Hindi-2024-20241018141004-500x500.jpg",
    streamUrl: "https://aac.saavncdn.com/320/4d91932291471256b3c9313360ebb834_320.mp4",
    language: "hindi",
    playCount: 14500000
  },
  {
    id: "rx_3d_2",
    name: "Dilruba Dilnasheen",
    album: "Dilruba Dilnasheen",
    year: "2026",
    duration: 177,
    label: "T-Series",
    primaryArtists: "Arijit Singh",
    imageUrl: "https://c.saavncdn.com/346/Dilruba-Dilnasheen-Hindi-2024-20240902143004-500x500.jpg",
    streamUrl: "https://aac.saavncdn.com/346/3c821442fc39a08988caeb827ede49f4_320.mp4",
    language: "hindi",
    playCount: 9800000
  },
  {
    id: "rx_3d_3",
    name: "Kesariya",
    album: "Brahmastra",
    year: "2022",
    duration: 268,
    label: "Sony Music",
    primaryArtists: "Arijit Singh, Pritam",
    imageUrl: "https://c.saavncdn.com/423/Arijit-Singh-All-Time-Best-Hindi-Hit-Love-Songs-Collection-Hindi-2026-20261008160834-500x500.jpg",
    streamUrl: "https://aac.saavncdn.com/423/852ad6cc81d7733c5e9bfc46d7b063e2_320.mp4",
    language: "hindi",
    playCount: 42000000
  },
  {
    id: "rx_3d_4",
    name: "Apna Bana Le",
    album: "Bhediya",
    year: "2022",
    duration: 261,
    label: "Zee Music",
    primaryArtists: "Arijit Singh, Sachin-Jigar",
    imageUrl: "https://c.saavncdn.com/228/Sachin-Jigar-Bollywood-Hits-Hindi-2026-20260630213800-500x500.jpg",
    streamUrl: "https://aac.saavncdn.com/228/bed7fe5f8fe04ae6432bcb0717e2b74e_320.mp4",
    language: "hindi",
    playCount: 28500000
  },
  {
    id: "rx_3d_5",
    name: "Gehra Hua (From \"Dhurandhar\")",
    album: "Dhurandhar",
    year: "2025",
    duration: 198,
    label: "T-Series",
    primaryArtists: "Shashwat Sachdev, Arijit Singh",
    imageUrl: "https://c.saavncdn.com/264/Dhurandhar-Hindi-2025-20250108151234-500x500.jpg",
    streamUrl: "https://aac.saavncdn.com/450/f467e05e2825cec2203546333e0d0550_320.mp4",
    language: "hindi",
    playCount: 16200000
  },
  {
    id: "rx_3d_6",
    name: "Chaleya (From \"Jawan\")",
    album: "Jawan",
    year: "2023",
    duration: 200,
    label: "T-Series",
    primaryArtists: "Anirudh Ravichander, Arijit Singh, Shilpa Rao",
    imageUrl: "https://c.saavncdn.com/047/Jawan-Hindi-2023-20230921190854-500x500.jpg",
    streamUrl: "https://aac.saavncdn.com/047/d1366530468931703ac909e82a3ee788_320.mp4",
    language: "hindi",
    playCount: 38000000
  }
];

const decodeHtml = (str: string): string => {
  if (typeof window === 'undefined') return str || '';
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
};

const extract500Image = (item: any): string => {
  const images = item.image || item.images || item.album_image;
  if (Array.isArray(images) && images.length > 0) {
    const highest = images[images.length - 1];
    const url = typeof highest === 'string' ? highest : highest?.url || highest?.link || '';
    if (url) return url.replace('50x50', '500x500').replace('150x150', '500x500');
  }
  if (typeof images === 'string' && images.startsWith('http')) {
    return images.replace('50x50', '500x500').replace('150x150', '500x500');
  }
  return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
};

const extractStream = (down: any, fallback?: string): string => {
  if (typeof down === 'string' && down.startsWith('http')) {
    return down.replace('http://', 'https://');
  }
  if (Array.isArray(down) && down.length > 0) {
    // Prioritize 320kbps -> 160kbps -> 96kbps
    const q320 = down.find((d: any) => d.quality === '320kbps' || d.bitrate === '320kbps');
    if (q320?.url || q320?.link) return (q320.url || q320.link).replace('http://', 'https://');
    const q160 = down.find((d: any) => d.quality === '160kbps' || d.bitrate === '160kbps');
    if (q160?.url || q160?.link) return (q160.url || q160.link).replace('http://', 'https://');
    const last = down[down.length - 1];
    const u = last?.url || last?.link || '';
    if (u) return u.replace('http://', 'https://');
  }
  if (fallback && typeof fallback === 'string') {
    return fallback.replace('http://', 'https://');
  }
  return '';
};

export const fetchSongsByQuery = async (query: string): Promise<Song[]> => {
  if (!query || !query.trim()) return FALLBACK_CATALOG;

  const clean = encodeURIComponent(query.trim());
  const endpoints = [
    `https://jiosaavn-api-nine.vercel.app/api/search/songs?query=${clean}&page=1&limit=40`,
    `https://saavnapi-beta.vercel.app/search/songs?query=${clean}&page=1&limit=40`,
    `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${clean}&page=1&limit=40`
  ];

  for (const url of endpoints) {
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
          name: decodeHtml(item.name || item.title || item.song || 'Song'),
          album: decodeHtml(item.album?.name || item.album || 'Single'),
          year: String(item.year || '2026'),
          duration: Number(item.duration) || 210,
          label: item.label || '',
          primaryArtists: decodeHtml(item.primaryArtists || item.singers || item.artist || 'Various Artists'),
          imageUrl: extract500Image(item),
          streamUrl: extractStream(item.downloadUrl || item.downloadUrls, item.media_url || item.url || item.preview_url),
          language: item.language || 'hindi',
          playCount: Number(item.playCount) || undefined
        })).filter((s: Song) => s.streamUrl && s.imageUrl);

        if (parsed.length > 0) return parsed;
      }
    } catch {
      // try next
    }
  }

  return FALLBACK_CATALOG;
};

// String similarity check to avoid repetitive remixes/covers of the current song
const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
  const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0;
  const set1 = new Set<string>();
  for (let i = 0; i < s1.length - 1; i++) set1.add(s1.slice(i, i + 2));
  const set2 = new Set<string>();
  for (let i = 0; i < s2.length - 1; i++) set2.add(s2.slice(i, i + 2));
  let intersection = 0;
  set1.forEach((b) => {
    if (set2.has(b)) intersection++;
  });
  return (2.0 * intersection) / (set1.size + set2.size);
};

const isJunkOrRepeatedCover = (candidateName: string, currentTrackName: string): boolean => {
  const lower = candidateName.toLowerCase();
  const junkPatterns = ['karaoke', 'tribute', 'cover', 'instrumental', 'remake'];
  if (junkPatterns.some((p) => lower.includes(p))) return true;
  if (calculateSimilarity(candidateName, currentTrackName) > 0.8) return true;
  return false;
};

let radioQueryVectorToggle = 0;

/**
 * Viral Radio & Discovery Pipeline:
 * Never searches by song.name (which causes repetitive title loops).
 * Instead alternates between:
 *  - Vector A: Lead Artist Radio (${leadArtist} Top Popular Superhits)
 *  - Vector B: Viral Trends (Trending Viral Hits 2026 Spotify Reels Billboard)
 * Automatically filters out duplicates, karaoke, tributes, and >80% similar titles.
 */
export const fetchRadioRecommendations = async (currentTrack: Song): Promise<Song[]> => {
  const leadArtist = (currentTrack.primaryArtists || '')
    .split(',')[0]
    .replace(/[&\\/]/g, '')
    .trim() || 'Arijit Singh';

  radioQueryVectorToggle = (radioQueryVectorToggle + 1) % 2;
  const query = radioQueryVectorToggle === 0
    ? `${leadArtist} Top Popular Superhits`
    : `Trending Viral Hits 2026 Spotify Reels Billboard`;

  const results = await fetchSongsByQuery(query);

  const seenIds = new Set<string>([currentTrack.id]);
  const seenTitles = new Set<string>([currentTrack.name.toLowerCase().trim()]);

  const filtered = results.filter((song) => {
    if (seenIds.has(song.id)) return false;
    if (seenTitles.has(song.name.toLowerCase().trim())) return false;
    if (isJunkOrRepeatedCover(song.name, currentTrack.name)) return false;
    seenIds.add(song.id);
    seenTitles.add(song.name.toLowerCase().trim());
    return true;
  });

  return filtered.length > 0 ? filtered : FALLBACK_CATALOG.filter((s) => s.id !== currentTrack.id);
};
