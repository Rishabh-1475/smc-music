export type CategoryMood =
  | 'All'
  | 'Energize'
  | 'Workout'
  | 'Relax'
  | 'Focus'
  | 'Commute'
  | 'Party'
  | 'Romance';

export interface Song {
  id: string;
  name: string;
  title: string;
  album: string;
  primaryArtists: string;
  duration: number | string;
  imageUrl: string;
  audioUrl: string;
  hasLyrics?: boolean;
  lyrics?: string;
  year?: string;
  isLiked?: boolean;
  isDisliked?: boolean;
  playCount?: number;
  [key: string]: any;
}

export interface QuickPickGroup {
  title: string;
  tracks: Song[];
  [key: string]: any;
}

export interface ShelfSection {
  title: string;
  subtitle?: string;
  items: Song[];
  [key: string]: any;
}

export interface CategoryChip {
  id: string;
  label: string;
  query: string;
  [key: string]: any;
}
