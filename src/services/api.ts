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
  downloadUrl?: any;
  downloadUrls?: any;
  [key: string]: any;
}

const decodeHtml = (html: string): string => {
  if (!html) return '';
  if (typeof window === 'undefined') {
    return html
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&#039;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  }
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

const extractBestImage = (images: any): string => {
  if (Array.isArray(images) && images.length > 0) {
    const best = images[images.length - 1];
    const url = typeof best === 'string' ? best : best?.url || best?.link || '';
    if (url) return url.replace('150x150', '500x500').replace('http://', 'https://');
  }
  if (typeof images === 'string' && images.length > 0) {
    return images.replace('150x150', '500x500').replace('http://', 'https://');
  }
  return 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.jpg';
};

const extractBestStream = (downloadUrls: any): string => {
  if (!Array.isArray(downloadUrls) || downloadUrls.length === 0) return '';
  const q320 = downloadUrls.find((u: any) => u.quality === '320kbps' || u.bitrate === '320');
  if (q320?.url || q320?.link) return q320.url || q320.link;
  const q160 = downloadUrls.find((u: any) => u.quality === '160kbps' || u.bitrate === '160');
  if (q160?.url || q160?.link) return q160.url || q160.link;
  const last = downloadUrls[downloadUrls.length - 1];
  return last?.url || last?.link || '';
};

/**
 * Decrypts JioSaavn DES-ECB encrypted media URLs to direct CDN streaming links.
 */
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
      // Upgrade 96kbps preview to 320kbps master
      return httpsUrl.includes('_96.') ? httpsUrl.replace(/_96\./g, '_320.') : httpsUrl;
    }
  } catch {
    // Fail silently
  }
  return '';
};

export const fetchSongsByQuery = async (query: string, page: number = 1): Promise<Song[]> => {
  const mirrors = [
    `https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=25`,
    `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=25`
  ];

  // 1. Try public mirrors
  for (const url of mirrors) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) continue;
      const data = await res.json();
      const rawList = data?.data?.results || data?.results || (Array.isArray(data?.data) ? data.data : []);

      if (Array.isArray(rawList) && rawList.length > 0) {
        const parsed = rawList
          .map((item: any) => {
            const rawImg = item.image || item.images;
            const rawAudio = item.downloadUrl || item.downloadUrls || item.media_url;
            const bestAudio = Array.isArray(rawAudio) ? extractBestStream(rawAudio) : (rawAudio || '');
            const bestImage = extractBestImage(rawImg);
            const name = decodeHtml(item.name || item.title || 'Unknown Track');
            return {
              id: String(item.id || Math.random()),
              name,
              title: name,
              album: decodeHtml(item.album?.name || item.album || 'Single'),
              year: String(item.year || '2026'),
              duration: item.duration || '3:20',
              label: item.label || '',
              primaryArtists: decodeHtml(item.primaryArtists || item.singers || item.artist || 'Various Artists'),
              imageUrl: bestImage,
              image: bestImage,
              streamUrl: bestAudio,
              audioUrl: bestAudio,
              language: item.language || 'hindi'
            };
          })
          .filter((s: Song) => s.streamUrl && s.imageUrl);

        if (parsed.length > 0) return parsed;
      }
    } catch {
      // Continue to next mirror
    }
  }

  // 2. Direct Official JioSaavn Gateway (Reliable High-Speed Fallback)
  try {
    const officialUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=25&p=${page}&q=${encodeURIComponent(query)}`;
    const res = await fetch(officialUrl, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const results = data?.results || [];
      if (Array.isArray(results) && results.length > 0) {
        const list: Song[] = [];
        for (const item of results) {
          const enc = item.more_info?.encrypted_media_url;
          const stream = decryptMediaUrl(enc);
          if (!stream) continue;
          let img = item.image || '';
          img = img.replace('150x150', '500x500').replace('http://', 'https://');
          const name = decodeHtml(item.title || item.name || 'Unknown Track');
          const songObj: Song = {
            id: String(item.id || Math.random()),
            name,
            title: name,
            album: decodeHtml(item.more_info?.album || item.album || 'Single'),
            year: String(item.year || '2026'),
            duration: item.more_info?.duration || item.duration || '210',
            label: item.more_info?.copyright_text || item.label || '',
            primaryArtists: decodeHtml(item.more_info?.primary_artists || item.more_info?.singers || 'Various Artists'),
            imageUrl: img || 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.jpg',
            image: img || 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.jpg',
            streamUrl: stream,
            audioUrl: stream,
            language: item.language || 'hindi'
          };
          list.push(songObj);
        }
        if (list.length > 0) return list;
      }
    }
  } catch {
    // Continue to curated fallback
  }

  // 3. Guaranteed High-Res Curated Fallback (Offline resilience)
  const curatedPool: Song[] = [
    ...(curatedData.quickPicks || []),
    ...(curatedData.trendingHits || []),
    ...(curatedData.punjabiHits || []),
    ...(curatedData.bhojpuriHits || [])
  ].map((t: any) => ({
    id: String(t.id),
    name: decodeHtml(t.name || t.title),
    title: decodeHtml(t.title || t.name),
    album: decodeHtml(t.album || 'Lossless Album'),
    year: String(t.year || '2026'),
    duration: t.duration || '210',
    label: t.label || 'SMC Records',
    primaryArtists: decodeHtml(t.primaryArtists || 'Featured Artist'),
    imageUrl: t.imageUrl || 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.jpg',
    image: t.imageUrl || 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.jpg',
    streamUrl: t.audioUrl || '',
    audioUrl: t.audioUrl || '',
    language: t.language || 'hindi'
  }));

  const qLow = query.toLowerCase();
  const matched = curatedPool.filter(
    (s) =>
      s.name.toLowerCase().includes(qLow) ||
      s.primaryArtists.toLowerCase().includes(qLow) ||
      s.album.toLowerCase().includes(qLow)
  );

  return matched.length > 0 ? matched : curatedPool.slice(0, 15);
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
    // Silent fallback
  }
  return '';
};
