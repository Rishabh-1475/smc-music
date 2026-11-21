/**
 * RYTHEMX Smart Related Radio Engine
 * Multi-Signal Collaborative Filtering, Language & Era Matching,
 * Personalized Taste Injection, and Aggressive Variant Blocking
 * Package: co.singhsmusic.rhythmx
 */

import { Song } from '../types/music';
import { extractCanonicalTitle, filterRelatedCandidates, isSameSongOrVariant } from './trackDedupe';
import { fetchSongSuggestions, fetchSongsByQuery } from './api';
import { tasteEngine } from './tasteEngine';

export interface RadioOptions {
  playedIds?: string[];
  blockedCanonicalTitles?: Set<string>;
  limit?: number;
}

// Language / Vibe Seeds for Signal C
const LANGUAGE_VIBE_SEEDS: Record<string, string[]> = {
  haryanvi: [
    'Masoom Sharma Hits',
    'Khasa Aala Chahar Hits',
    'Dhanda Nyoliwala Hits',
    'Gulzaar Chhaniwala Top Songs',
    'Haryanvi Top Hits 2026'
  ],
  punjabi: [
    'Sidhu Moose Wala All Hits',
    'Karan Aujla Latest Songs',
    'Shubh Hits',
    'Diljit Dosanjh Punjabi Bangers',
    'Top Punjabi Hits 2026'
  ],
  hindi: [
    'Arijit Singh Romantic Hits',
    'Pritam Bollywood Classics',
    'Atif Aslam Hits',
    'Mohit Chauhan Melodies',
    'Trending Bollywood Songs 2026'
  ],
  bhojpuri: [
    'Pawan Singh Dhamaka Hits',
    'Khesari Lal Yadav New Songs',
    'Shilpi Raj Top Bhojpuri',
    'Bhojpuri Top Chartbusters 2026'
  ],
  tamil: [
    'Anirudh Ravichander Blockbusters',
    'A.R. Rahman Tamil Melodies',
    'Sid Sriram Tamil Hits',
    'Tamil Top 50 2026'
  ],
  telugu: [
    'Devi Sri Prasad Telugu Mass Hits',
    'Thaman S Blockbuster Beats',
    'Telugu Top Hits 2026'
  ],
  phonk: [
    'Drift Phonk Workout',
    'Gym Phonk Bass Boosted',
    'Kordhell Phonk Beats'
  ]
};

/**
 * Builds a smart 20-track related radio queue seeded from a single track.
 * Guarantees zero duplicate versions, female covers, or lofi edits of the seed song.
 */
export async function buildSmartRadioQueue(
  seedTrack: Song,
  options: RadioOptions = {}
): Promise<Song[]> {
  if (!seedTrack) return [];

  const targetLimit = options.limit || 20;
  const playedIds = new Set<string>(options.playedIds || []);
  const blockedCanons = new Set<string>(options.blockedCanonicalTitles || []);

  // Add seed track ID and canonical title to blocked sets
  playedIds.add(seedTrack.id);
  const seedCanon = extractCanonicalTitle(seedTrack.name || seedTrack.title || '');
  if (seedCanon) blockedCanons.add(seedCanon);

  // Extract artists
  const artists = (seedTrack.primaryArtists || (seedTrack as any).artist || '')
    .split(',')
    .map((a: string) => a.replace(/feat\..*$/i, '').trim())
    .filter(Boolean);
  const leadArtist = artists[0] || 'Arijit Singh';
  const coArtist = artists[1];

  // Detect language / vibe
  let detectedLang = (seedTrack.language || 'hindi').toLowerCase();
  const seedTitleLower = (seedTrack.name || seedTrack.title || '').toLowerCase();
  if (seedTitleLower.includes('gaadi') || seedTitleLower.includes('rohtak') || leadArtist.includes('Saini')) {
    detectedLang = 'haryanvi';
  } else if (seedTitleLower.includes('phonk') || seedTitleLower.includes('drift')) {
    detectedLang = 'phonk';
  }

  // --- MULTI-SIGNAL PARALLEL PIPELINE ---
  // Signal A: Native suggestions / artist radio
  const pSignalA = fetchSongSuggestions(seedTrack.id, 25, seedTrack);

  // Signal B: Artist & Co-Artist ecosystem queries
  const artistQuery = coArtist ? `${coArtist} Hits` : `${leadArtist} Top Hits`;
  const pSignalB = fetchSongsByQuery(artistQuery);

  // Signal C: Language & Vibe match
  const vibeSeedList = LANGUAGE_VIBE_SEEDS[detectedLang] || LANGUAGE_VIBE_SEEDS.hindi;
  const chosenVibeQuery = vibeSeedList[Math.floor(Math.random() * vibeSeedList.length)];
  const pSignalC = fetchSongsByQuery(chosenVibeQuery);

  const [resA, resB, resC] = await Promise.allSettled([pSignalA, pSignalB, pSignalC]);

  const candidatesA: Song[] = resA.status === 'fulfilled' && Array.isArray(resA.value) ? resA.value : [];
  const candidatesB: Song[] = resB.status === 'fulfilled' && Array.isArray(resB.value) ? resB.value : [];
  const candidatesC: Song[] = resC.status === 'fulfilled' && Array.isArray(resC.value) ? resC.value : [];

  const sigASet = new Set(candidatesA.map((s) => s.id));

  // Merge raw candidates
  const mergedPool: Song[] = [...candidatesA, ...candidatesB, ...candidatesC];

  // Filter with aggressive variant blocker and artist diversity cap
  const filteredCandidates = filterRelatedCandidates(
    mergedPool,
    [seedTrack],
    playedIds,
    blockedCanons
  );

  // Score and Rank Candidates
  const profile = tasteEngine.getProfile();
  const seedYear = parseInt(seedTrack.year || '2024', 10) || 2024;

  const scoredTracks = filteredCandidates.map((song) => {
    let score = 0;

    // Signal A native recommendation bonus (+40)
    if (sigASet.has(song.id)) {
      score += 40;
    }

    // Language match (+25)
    const songLang = (song.language || 'hindi').toLowerCase();
    if (songLang === detectedLang) {
      score += 25;
    }

    // User Artist Affinity (+20)
    const songArtists = (song.primaryArtists || '').split(',').map((a) => a.trim());
    for (const art of songArtists) {
      const affinity = profile.artistAffinities[art] || 0;
      if (affinity > 0) {
        score += Math.min(20, affinity);
      }
      // Quick-skip penalty (-50)
      const penalty = profile.sessionSkippedArtists[art] || 0;
      if (penalty > 0) {
        score -= penalty * 15;
      }
    }

    // Era match within ±4 years (+15)
    const songYear = parseInt(song.year || '2024', 10) || 2024;
    if (Math.abs(songYear - seedYear) <= 4) {
      score += 15;
    }

    // Light controlled jitter (±8) for natural variation
    score += (Math.random() * 16 - 8);

    return { song, score };
  });

  // Sort descending by score
  scoredTracks.sort((a, b) => b.score - a.score);
  const rankedTracks: Song[] = scoredTracks.map((item) => item.song);

  // Signal D: Personalized Taste Injection
  // Weave 2-3 relevant liked songs into positions #4, #9, #15
  const likedSongs = profile.likedTracks.map((item) => item.song);
  const eligibleLiked = filterRelatedCandidates(
    likedSongs.filter((s) => !playedIds.has(s.id)),
    [seedTrack],
    playedIds,
    blockedCanons
  );

  const finalQueue: Song[] = [];
  let likedIdx = 0;
  let rankedIdx = 0;

  for (let i = 0; i < targetLimit; i++) {
    // Inject liked track at positions 4, 9, 14 if available and language matches
    const shouldInjectLiked =
      (i === 3 || i === 8 || i === 14) &&
      likedIdx < eligibleLiked.length;

    if (shouldInjectLiked) {
      finalQueue.push(eligibleLiked[likedIdx]);
      likedIdx++;
    } else if (rankedIdx < rankedTracks.length) {
      finalQueue.push(rankedTracks[rankedIdx]);
      rankedIdx++;
    } else if (likedIdx < eligibleLiked.length) {
      finalQueue.push(eligibleLiked[likedIdx]);
      likedIdx++;
    }
  }

  // Final sanity filter against the seed song
  return finalQueue.filter((s) => !isSameSongOrVariant(s, seedTrack));
}
