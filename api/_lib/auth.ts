import { createHmac, timingSafeEqual } from 'node:crypto';
import type { VercelRequest } from '@vercel/node';

const TOKEN_TTL_MS = 1000 * 60 * 60 * 8;

interface TokenPayload {
  sub: 'admin';
  exp: number;
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET não configurado');
  }
  return secret;
}

function sign(payload: TokenPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', getSecret()).update(body).digest('base64url');
  return `${body}.${signature}`;
}

export function createAuthToken(): string {
  return sign({
    sub: 'admin',
    exp: Date.now() + TOKEN_TTL_MS,
  });
}

export function verifyAuthToken(token: string): boolean {
  const [body, signature] = token.split('.');
  if (!body || !signature) {
    return false;
  }

  const expected = createHmac('sha256', getSecret()).update(body).digest('base64url');
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as TokenPayload;
    return payload.sub === 'admin' && typeof payload.exp === 'number' && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function passwordsMatch(input: string, expected: string): boolean {
  const left = Buffer.from(input);
  const right = Buffer.from(expected);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

export function requireAuth(req: VercelRequest): boolean {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return false;
  }
  return verifyAuthToken(header.slice('Bearer '.length));
}
