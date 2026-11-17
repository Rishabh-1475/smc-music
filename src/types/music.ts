export interface Song {
  id: string;
  name: string;
  title: string;
  album: string | { name: string; [key: string]: any };
  duration: number | string;
  primaryArtists: string;
  imageUrl: string;
  audioUrl: string;
  hasLyrics?: boolean;
  lyrics?: string;
  year?: string | number;
  copyright?: string;
  artists?: string;
  image?: any;
  downloadUrl?: any;
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
