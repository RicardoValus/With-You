import { put } from '@vercel/blob';

const CONTENT_BLOB_PATH = 'with-you/content.json';

const DEFAULT_CONTENT = {
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

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error('Defina BLOB_READ_WRITE_TOKEN antes de rodar o seed');
  process.exit(1);
}

const blob = await put(CONTENT_BLOB_PATH, JSON.stringify(DEFAULT_CONTENT, null, 2), {
  access: 'public',
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: 'application/json',
  token,
});

console.log(`Seed ok: ${blob.url}`);
