import type { VercelRequest, VercelResponse } from '@vercel/node';

export function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
}

export function handleOptions(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method === 'OPTIONS') {
    setCors(res);
    res.status(204).end();
    return true;
  }
  return false;
}

export function sendJson(res: VercelResponse, status: number, body: unknown): void {
  setCors(res);
  res.status(status).json(body);
}

export function sendError(res: VercelResponse, status: number, message: string): void {
  sendJson(res, status, { error: message });
}

export function readJsonBody<T>(req: VercelRequest): T {
  if (typeof req.body === 'string') {
    return JSON.parse(req.body) as T;
  }
  return req.body as T;
}
