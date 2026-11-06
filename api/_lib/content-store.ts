import { list, put } from '@vercel/blob';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CONTENT_BLOB_PATH, DEFAULT_CONTENT } from './seed';
import type { Content } from './types';

const LOCAL_CONTENT_PATH = path.join(process.cwd(), 'data', 'content.local.json');

let memoryContent: Content | null = null;
let cachedBlobUrl: string | null = null;

function hasBlobToken(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function cloneContent(content: Content): Content {
  return structuredClone(content);
}

async function readLocal(): Promise<Content> {
  if (memoryContent) {
    return cloneContent(memoryContent);
  }

  try {
    const raw = await readFile(LOCAL_CONTENT_PATH, 'utf8');
    memoryContent = JSON.parse(raw) as Content;
    return cloneContent(memoryContent);
  } catch {
    memoryContent = cloneContent(DEFAULT_CONTENT);
    return cloneContent(memoryContent);
  }
}

async function writeLocal(content: Content): Promise<Content> {
  memoryContent = cloneContent(content);
  await mkdir(path.dirname(LOCAL_CONTENT_PATH), { recursive: true });
  await writeFile(LOCAL_CONTENT_PATH, JSON.stringify(content, null, 2), 'utf8');
  return cloneContent(memoryContent);
}

async function resolveBlobUrl(): Promise<string | null> {
  if (cachedBlobUrl) {
    return cachedBlobUrl;
  }

  const result = await list({
    prefix: CONTENT_BLOB_PATH,
    limit: 10,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  const exact = result.blobs.find((blob) => blob.pathname === CONTENT_BLOB_PATH)
    ?? result.blobs[0];

  cachedBlobUrl = exact?.url ?? null;
  return cachedBlobUrl;
}

async function readBlob(): Promise<Content> {
  const url = await resolveBlobUrl();
  if (!url) {
    return writeBlob(DEFAULT_CONTENT);
  }

  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    return writeBlob(DEFAULT_CONTENT);
  }

  return (await response.json()) as Content;
}

async function writeBlob(content: Content): Promise<Content> {
  const blob = await put(CONTENT_BLOB_PATH, JSON.stringify(content, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  cachedBlobUrl = blob.url;
  return cloneContent(content);
}

export async function getContent(): Promise<Content> {
  if (!hasBlobToken()) {
    return readLocal();
  }
  return readBlob();
}

export async function saveContent(content: Content): Promise<Content> {
  if (!hasBlobToken()) {
    return writeLocal(content);
  }
  return writeBlob(content);
}

export async function updateContent(patch: Partial<Content>): Promise<Content> {
  const current = await getContent();
  const next: Content = {
    ...current,
    ...patch,
    music: patch.music === undefined ? current.music : patch.music,
    gallery: patch.gallery ?? current.gallery,
  };
  return saveContent(next);
}
