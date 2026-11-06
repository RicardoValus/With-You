import type { VercelRequest, VercelResponse } from '@vercel/node';
import { del, put } from '@vercel/blob';
import { requireAuth } from './_lib/auth';
import { getContent, saveContent } from './_lib/content-store';
import { handleOptions, readJsonBody, sendError, sendJson } from './_lib/http';
import type { GalleryImage } from './_lib/types';

interface UploadBody {
  fileName?: string;
  mimeType?: string;
  dataBase64?: string;
}

interface DeleteBody {
  id?: string;
}

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function createImageId(): string {
  return `img_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (handleOptions(req, res)) {
    return;
  }

  if (!requireAuth(req)) {
    sendError(res, 401, 'Não autorizado');
    return;
  }

  try {
    if (req.method === 'POST') {
      const body = readJsonBody<UploadBody>(req);
      const fileName = body.fileName?.trim() || 'foto.jpg';
      const mimeType = body.mimeType || 'image/jpeg';
      const dataBase64 = body.dataBase64;

      if (!dataBase64) {
        sendError(res, 400, 'Envie dataBase64 da imagem');
        return;
      }

      if (!ALLOWED_MIME.has(mimeType)) {
        sendError(res, 400, 'Tipo de imagem não permitido');
        return;
      }

      const buffer = Buffer.from(dataBase64, 'base64');
      if (buffer.byteLength > MAX_IMAGE_BYTES) {
        sendError(res, 400, 'Imagem excede 8MB');
        return;
      }

      const id = createImageId();
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      let url: string;

      if (token) {
        const uploaded = await put(`with-you/gallery/${id}-${fileName}`, buffer, {
          access: 'public',
          contentType: mimeType,
          token,
        });
        url = uploaded.url;
      } else {
        url = `data:${mimeType};base64,${dataBase64}`;
      }

      const image: GalleryImage = {
        id,
        url,
        uploadedAt: new Date().toISOString(),
      };

      const content = await getContent();
      content.gallery = [...content.gallery, image];
      if (!content.coverImageId) {
        content.coverImageId = image.id;
      }

      sendJson(res, 200, await saveContent(content));
      return;
    }

    if (req.method === 'DELETE') {
      const body = readJsonBody<DeleteBody>(req);
      const id = body.id ?? (typeof req.query.id === 'string' ? req.query.id : undefined);

      if (!id) {
        sendError(res, 400, 'Informe o id da imagem');
        return;
      }

      const content = await getContent();
      const target = content.gallery.find((item) => item.id === id);
      if (!target) {
        sendError(res, 404, 'Imagem não encontrada');
        return;
      }

      if (process.env.BLOB_READ_WRITE_TOKEN && target.url.includes('blob.vercel-storage.com')) {
        try {
          await del(target.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
        } catch {
          // segue mesmo se o blob já tiver sido removido
        }
      }

      content.gallery = content.gallery.filter((item) => item.id !== id);
      if (content.coverImageId === id) {
        content.coverImageId = content.gallery[0]?.id ?? null;
      }

      sendJson(res, 200, await saveContent(content));
      return;
    }

    sendError(res, 405, 'Método não permitido');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno';
    sendError(res, 500, message);
  }
}
