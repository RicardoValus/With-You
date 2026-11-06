export interface MusicContent {
  url: string;
  name: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  uploadedAt: string;
}

export interface Content {
  startDate: string;
  title: string;
  phrase: string;
  coverImageId: string | null;
  music: MusicContent | null;
  gallery: GalleryImage[];
}

export interface ContentUpdate {
  startDate?: string;
  title?: string;
  phrase?: string;
  coverImageId?: string | null;
  music?: MusicContent | null;
}
