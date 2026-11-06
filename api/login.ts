import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createAuthToken, passwordsMatch } from './_lib/auth';
import { handleOptions, readJsonBody, sendError, sendJson } from './_lib/http';

interface LoginBody {
  password?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (handleOptions(req, res)) {
    return;
  }

  if (req.method !== 'POST') {
    sendError(res, 405, 'Método não permitido');
    return;
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || !process.env.AUTH_SECRET) {
    sendError(res, 500, 'Autenticação não configurada no servidor');
    return;
  }

  try {
    const body = readJsonBody<LoginBody>(req);
    const password = body.password ?? '';
    if (!passwordsMatch(password, adminPassword)) {
      sendError(res, 401, 'Senha inválida');
      return;
    }

    sendJson(res, 200, { token: createAuthToken() });
  } catch {
    sendError(res, 400, 'Corpo inválido');
  }
}
