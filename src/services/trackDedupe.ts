/**
 * RYTHEMX Advanced Song Normalization & Variant Blocker Engine
 * Eliminates duplicate tracks, covers, lofi edits, female versions, slowed+reverb loops
 * Package: co.singhsmusic.rhythmx
 */

import { Song } from '../types/music';

// Variant tokens stripped from titles
const VARIANT_TOKENS: string[] = [
  'lofi',
  'lo fi',
  'slowed',
  'reverb',
  'reverbed',
  'female',
  'male',
  'version',
  'ver',
  'remix',
  'rmx',
  'dj',
  'mashup',
  'unplugged',
  'acoustic',
  'cover',
  'live',
  'instrumental',
  'karaoke',
  '8d',
  '3d',
  'sped up',
  'speed up',
  'nightcore',
  'reprise',
  'reprised',
  'sad',
  'happy',
  'romantic',
  'extended',
  'edit',
  'radio edit',
  'official',
  'audio',
  'video',
  'full song',
  'ringtone',
  'status',
  'whatsapp',
  'mix',
  'club mix',
  'bass boosted',
  'from',
  'feat',
  'ft',
  'featuring',
  'original',
  'motion picture',
  'soundtrack',
  'ost'
];

// Low-quality / junk phrases that should never appear in Auto-Radio unless seed is instrumental/lofi
const JUNK_TOKENS: string[] = [
  'ringtone',
  '8d audio',
  'karaoke',
  'instrumental',
  'whatsapp status',
  'slowed + reverb',
  'slowed and reverb',
  'slowed',
  'reverb',
  'sped up',
  'speed up',
  'lofi',
  'lo-fi',
  'lo fi',
  'lofi flip',
  'female version',
  'male version',
  'status video',
  'dialogue mix',
  'bgm ringtone'
];

/**
 * Phonetically normalizes Indian spelling variations and collapsed double characters
 * e.g. "kaali" -> "kali", "gaadi" -> "gadi", "pyaar" -> "pyar", "ishq" -> "isk"
 */
export function normalizePhoneticIndian(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/aa+/g, 'a')
    .replace(/ee+/g, 'i')
    .replace(/ii+/g, 'i')
    .replace(/oo+/g, 'u')
    .replace(/uu+/g, 'u')
    .replace(/sh+/g, 's')
    .replace(/kh+/g, 'k')
    .replace(/gh+/g, 'g')
    .replace(/dh+/g, 'd')
    .replace(/th+/g, 't')
    .replace(/ph+/g, 'f')
    .replace(/bh+/g, 'b')
    .replace(/z+/g, 'j')
    .replace(/q+/g, 'k')
    .replace(/([a-z])\1+/g, '$1') // collapse any remaining double letters (e.g. "dill" -> "dil")
    .trim();
}

/**
 * Extract canonical title key from raw song title
 * Strips parentheses, brackets, version descriptors, variant tokens, and phonetically normalizes.
 */
export function extractCanonicalTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  let s = rawTitle.toLowerCase();

  // Decode common HTML entities
  s = s
    .replace(/&amp;/g, 'and')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  // Strip parentheses and brackets: (Female Version), [Lofi Mix], {Official Video}
  s = s
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\{[^}]*\}/g, ' ');

  // Strip content after dash, pipe, or colon if it has descriptors
  const parts = s.split(/[-|:]/);
  if (parts.length > 1) {
    s = parts[0];
  }

  // Strip all non-alphanumeric characters (emojis, punctuation)
  s = s.replace(/[^a-z0-9\s]/g, ' ');

  // Strip known variant tokens (whole word matches)
  for (const token of VARIANT_TOKENS) {
    const regex = new RegExp(`\\b${token}\\b`, 'gi');
    s = s.replace(regex, ' ');
  }

  // Clean extra whitespace
  s = s.trim().replace(/\s+/g, ' ');

  // Phonetic collapse
  return normalizePhoneticIndian(s);
}

/**
 * Computes word-token Jaccard similarity between two strings (0.0 to 1.0)
 */
export function calculateJaccardSimilarity(a: string, b: string): number {
  const setA = new Set(a.split(/\s+/).filter(Boolean));
  const setB = new Set(b.split(/\s+/).filter(Boolean));
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union > 0 ? intersection / union : 0;
}

/**
 * Computes character bigram Dice coefficient (0.0 to 1.0)
 */
export function calculateDiceSimilarity(a: string, b: string): number {
  if (a === b) return 1.0;
  if (a.length < 2 || b.length < 2) return 0.0;

  const bigramsA = new Map<string, number>();
  for (let i = 0; i < a.length - 1; i++) {
    const bg = a.substring(i, i + 2);
    bigramsA.set(bg, (bigramsA.get(bg) || 0) + 1);
  }

  let intersection = 0;
  for (let i = 0; i < b.length - 1; i++) {
    const bg = b.substring(i, i + 2);
    const count = bigramsA.get(bg) || 0;
    if (count > 0) {
      bigramsA.set(bg, count - 1);
      intersection++;
    }
  }

  return (2.0 * intersection) / (a.length - 1 + b.length - 1);
}

/**
 * Checks if a candidate track is low-quality junk (ringtone, whatsapp status, 8d audio, etc.)
 */
export function isJunkOrLowQualityVariant(
  candidate: Song,
  isSeedLofiOrInstrumental = false
): boolean {
  if (isSeedLofiOrInstrumental) return false;
  const name = (candidate.name || candidate.title || '').toLowerCase();
  for (const token of JUNK_TOKENS) {
    if (name.includes(token)) return true;
  }
  // Filter out ultra-short clips (< 70 seconds)
  const dur = Number(candidate.duration) || 0;
  if (dur > 0 && dur < 70) return true;

  return false;
}

/**
 * Returns true if candidate is the exact same song, a cover, a remix, or a variant of reference.
 */
export function isSameSongOrVariant(
  candidate: Song,
  reference: Song,
  isSeedLofiOrInstrumental = false
): boolean {
  if (!candidate || !reference) return false;

  // 1. Direct ID match
  if (candidate.id && reference.id && candidate.id === reference.id) {
    return true;
  }

  // 2. Reject junk tracks in auto-radio
  if (isJunkOrLowQualityVariant(candidate, isSeedLofiOrInstrumental)) {
    return true;
  }

  const candTitle = candidate.name || candidate.title || '';
  const refTitle = reference.name || reference.title || '';

  const candCanon = extractCanonicalTitle(candTitle);
  const refCanon = extractCanonicalTitle(refTitle);

  if (!candCanon || !refCanon) return false;

  // 3. Exact canonical match
  if (candCanon === refCanon) {
    return true;
  }

  // 4. Substring match for canonical titles >= 4 characters
  // e.g. "kali gadi" in "kali gadi do" or "kali gadi reload"
  if (candCanon.length >= 4 && refCanon.length >= 4) {
    if (candCanon.includes(refCanon) || refCanon.includes(candCanon)) {
      return true;
    }
  }

  // 5. Jaccard token similarity & Character Dice similarity (Threshold >= 0.45)
  const jaccard = calculateJaccardSimilarity(candCanon, refCanon);
  const dice = calculateDiceSimilarity(candCanon, refCanon);

  if (jaccard >= 0.45 || dice >= 0.45) {
    return true;
  }

  return false;
}

/**
 * Filters candidates for related radio, enforcing:
 * 1. Blocking seed song and all its variants (lofi, female, remix, slowed).
 * 2. Blocking recently played track IDs and canonical titles.
 * 3. Deduplicating candidates among themselves.
 * 4. Artist Diversity Cap: Max 2 songs per primary artist in any 10-track window, no back-to-back same artist.
 */
export function filterRelatedCandidates(
  candidates: Song[],
  seedSongs: Song[],
  blockedIds: Set<string> = new Set(),
  blockedCanonicalTitles: Set<string> = new Set()
): Song[] {
  const result: Song[] = [];
  const seenCandidateCanons = new Set<string>();
  const seenCandidateIds = new Set<string>();

  // Determine if seed is explicitly lofi or instrumental
  const isSeedLofiOrInstrumental = seedSongs.some((s) => {
    const t = (s.name || s.title || '').toLowerCase();
    return t.includes('lofi') || t.includes('instrumental') || t.includes('chillhop');
  });

  // Prepopulate blocked canonical titles from seed songs
  const allBlockedCanons = new Set<string>(blockedCanonicalTitles);
  for (const s of seedSongs) {
    const c = extractCanonicalTitle(s.name || s.title || '');
    if (c) allBlockedCanons.add(c);
  }

  for (const candidate of candidates) {
    if (!candidate || !candidate.streamUrl) continue;
    if (blockedIds.has(candidate.id) || seenCandidateIds.has(candidate.id)) continue;

    // Check against seed songs
    let isVariantOfSeed = false;
    for (const seed of seedSongs) {
      if (isSameSongOrVariant(candidate, seed, isSeedLofiOrInstrumental)) {
        isVariantOfSeed = true;
        break;
      }
    }
    if (isVariantOfSeed) continue;

    const canon = extractCanonicalTitle(candidate.name || candidate.title || '');
    if (!canon) continue;

    // Check against blocked canonical titles
    if (allBlockedCanons.has(canon) || seenCandidateCanons.has(canon)) {
      continue;
    }

    // Artist Diversity Cap:
    const artist = (candidate.primaryArtists || (candidate as any).artist || '')
      .split(',')[0]
      .trim()
      .toLowerCase();

    if (artist && result.length > 0) {
      // 1. Never place two songs by the same primary artist back-to-back
      const prevArtist = (result[result.length - 1].primaryArtists || '')
        .split(',')[0]
        .trim()
        .toLowerCase();
      if (prevArtist && prevArtist === artist) {
        continue;
      }

      // 2. Max 2 songs by the exact same primary artist inside the last 10 tracks
      const recentWindow = result.slice(-10);
      const artistCountInWindow = recentWindow.filter((s) => {
        const a = (s.primaryArtists || '').split(',')[0].trim().toLowerCase();
        return a === artist;
      }).length;

      if (artistCountInWindow >= 2) {
        continue;
      }
    }

    seenCandidateIds.add(candidate.id);
    seenCandidateCanons.add(canon);
    result.push(candidate);
  }

  return result;
}
