export interface Song {
  id: string;
  name: string;
  title?: string;
  album:
    | string
    | {
        id?: string;
        name: string;
        url?: string;
        [key: string]: any;
      };
  duration: number | string;
  primaryArtists: string;
  artists?: string;
  imageUrl: string;
  audioUrl: string;
  hasLyrics?: boolean;
  lyrics?: string;
  year?: string | number;
  copyright?: string;
  image?:
    | string
    | {
        quality?: string;
        url?: string;
        link?: string;
        [key: string]: any;
      }[]
    | any;
  downloadUrl?:
    | string
    | {
        quality?: string;
        url?: string;
        link?: string;
        [key: string]: any;
      }[]
    | any;
  featuredArtists?: string;
  label?: string;
  url?: string;
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
