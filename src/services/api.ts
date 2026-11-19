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

const decodeHtml = (html: string): string => {
  if (typeof window === 'undefined') return html || '';
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

const extractBestImage = (images: any): string => {
  if (Array.isArray(images) && images.length > 0) {
    const highest = images[images.length - 1];
    const url = typeof highest === 'string' ? highest : highest?.url || highest?.link || '';
    if (url) return url.replace('50x50', '500x500').replace('150x150', '500x500');
  }
  if (typeof images === 'string' && images.length > 0) {
    return images.replace('50x50', '500x500').replace('150x150', '500x500');
  }
  return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
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

export const fetchSongsByQuery = async (query: string, page: number = 1): Promise<Song[]> => {
  if (!query || !query.trim()) return [];

  const clean = query.trim();

  // 1. Try server proxy route first (zero CORS in browser)
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(clean)}&page=${page}`);
    if (res.ok) {
      const data = await res.json();
      const rawList = data?.results || [];

      if (Array.isArray(rawList) && rawList.length > 0) {
        return rawList.map((item: any) => {
          const rawImg = item.image || item.images || item.album_image;
          const rawAudio = item.downloadUrl || item.downloadUrls || item.media_urls;
          const stream = extractBestStream(rawAudio, item.media_url);
          const img = extractBestImage(rawImg);
          const name = decodeHtml(item.name || item.title || item.song || 'Song');
          return {
            id: item.id || String(Math.random()),
            name,
            title: name,
            album: decodeHtml(item.album?.name || item.album || 'Single'),
            year: String(item.year || '2026'),
            duration: item.duration || '210',
            label: item.label || '',
            primaryArtists: decodeHtml(item.primaryArtists || item.singers || item.artist || 'Various Artists'),
            imageUrl: img,
            image: img,
            streamUrl: stream,
            audioUrl: stream,
            language: item.language || 'hindi'
          };
        }).filter((s: Song) => s.streamUrl && s.imageUrl);
      }
    }
  } catch {
    // If /api/search is not reachable (e.g. mobile static environment), fall through to direct mirror
  }

  // 2. Direct CORS-enabled public mirror fallback
  try {
    const directRes = await fetch(`https://saavnapi-beta.vercel.app/search/songs?query=${encodeURIComponent(clean)}&page=${page}&limit=40`, { cache: 'no-store' });
    if (directRes.ok) {
      const data = await directRes.json();
      const rawList = data?.data?.results || data?.results || [];
      if (Array.isArray(rawList) && rawList.length > 0) {
        return rawList.map((item: any) => {
          const rawImg = item.image || item.images || item.album_image;
          const rawAudio = item.downloadUrl || item.downloadUrls || item.media_urls;
          const stream = extractBestStream(rawAudio, item.media_url);
          const img = extractBestImage(rawImg);
          const name = decodeHtml(item.name || item.title || item.song || 'Song');
          return {
            id: item.id || String(Math.random()),
            name,
            title: name,
            album: decodeHtml(item.album?.name || item.album || 'Single'),
            year: String(item.year || '2026'),
            duration: item.duration || '210',
            label: item.label || '',
            primaryArtists: decodeHtml(item.primaryArtists || item.singers || item.artist || 'Various Artists'),
            imageUrl: img,
            image: img,
            streamUrl: stream,
            audioUrl: stream,
            language: item.language || 'hindi'
          };
        }).filter((s: Song) => s.streamUrl && s.imageUrl);
      }
    }
  } catch {
    // Fail gracefully
  }

  return [];
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
