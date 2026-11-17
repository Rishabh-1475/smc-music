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
  image:
    | string
    | {
        quality?: string;
        url?: string;
        link?: string;
        [key: string]: any;
      }[]
    | any;
  imageUrl: string;
  downloadUrl:
    | string
    | {
        quality?: string;
        url?: string;
        link?: string;
        [key: string]: any;
      }[]
    | any;
  audioUrl: string;
  year?: string | number;
  label?: string;
  artists?: string;
  featuredArtists?: string;
  hasLyrics?: boolean;
  url?: string;
  copyright?: string;
  [key: string]: any;
}
