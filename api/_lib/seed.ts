import type { Content } from './types';

export const CONTENT_BLOB_PATH = 'with-you/content.json';

export const DEFAULT_CONTENT: Content = {
  startDate: '2026-11-05T12:36:00-03:00',
  title: 'Desde que te conheci',
  phrase: 'que cabelo lindo, amei seus cachos',
  coverImageId: null,
  music: {
    url: '/assets/music/With_You_-_Linkin_Park_(Hybrid_Theory).wav',
    name: 'With You — Linkin Park',
  },
  gallery: [],
};
