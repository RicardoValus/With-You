import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';
import { requireAuth } from './_lib/auth';
import { getContent, updateContent } from './_lib/content-store';
import { handleOptions, readJsonBody, sendError, sendJson } from './_lib/http';
import type { ContentUpdate, MusicContent } from './_lib/types';

interface MusicUploadBody {
  fileName?: string;
  mimeType?: string;
  dataBase64?: string;
}

const MAX_MUSIC_BYTES = 15 * 1024 * 1024;

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (handleOptions(req, res)) {
    return;
  }

  try {
    if (req.method === 'GET') {
      sendJson(res, 200, await getContent());
      return;
    }

    if (req.method === 'PUT') {
      if (!requireAuth(req)) {
        sendError(res, 401, 'Não autorizado');
        return;
      }

      const patch = readJsonBody<ContentUpdate>(req);
      const next = await updateContent({
        startDate: patch.startDate,
        title: patch.title,
        phrase: patch.phrase,
        coverImageId: patch.coverImageId,
        music: patch.music,
      });
      sendJson(res, 200, next);
      return;
    }

    if (req.method === 'POST') {
      if (!requireAuth(req)) {
        sendError(res, 401, 'Não autorizado');
        return;
      }

      const body = readJsonBody<MusicUploadBody>(req);
      const fileName = body.fileName?.trim() || 'musica.mp3';
      const mimeType = body.mimeType || 'audio/mpeg';
      const dataBase64 = body.dataBase64;

      if (!dataBase64) {
        sendError(res, 400, 'Envie dataBase64 da música');
        return;
      }

      if (!mimeType.includes('audio') && !fileName.toLowerCase().endsWith('.mp3')) {
        sendError(res, 400, 'Apenas áudio .mp3 é permitido');
        return;
      }

      const buffer = Buffer.from(dataBase64, 'base64');
      if (buffer.byteLength > MAX_MUSIC_BYTES) {
        sendError(res, 400, 'Arquivo de música excede 15MB');
        return;
      }

      const token = process.env.BLOB_READ_WRITE_TOKEN;
      let music: MusicContent;

      if (token) {
        const uploaded = await put(`with-you/music/${Date.now()}-${fileName}`, buffer, {
          access: 'public',
          contentType: mimeType,
          token,
        });
        music = { url: uploaded.url, name: fileName.replace(/\.mp3$/i, '') };
      } else {
        music = {
          url: `data:${mimeType};base64,${dataBase64}`,
          name: fileName.replace(/\.mp3$/i, ''),
        };
      }

      sendJson(res, 200, await updateContent({ music }));
      return;
    }

    sendError(res, 405, 'Método não permitido');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno';
    sendError(res, 500, message);
  }
}
