import { createHmac, timingSafeEqual } from 'node:crypto';

export type Session = { sub: number; email: string; role: string };

// RETO A04 (Cryptographic Failures)
// Secreto de firma escrito en el codigo y trivial de adivinar: cualquiera que lo
// conozca (o lo pruebe) puede fabricar un token de administrador.
const SECRET = 'secret';

const b64 = (s: string) => Buffer.from(s).toString('base64url');
const sign = (data: string) => createHmac('sha256', SECRET).update(data).digest('base64url');

// Formato del token: base64url(JSON del payload) + "." + HMAC-SHA256
export function signToken(session: Session): string {
  const payload = b64(JSON.stringify(session));
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string): Session | null {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString()) as Session;
  } catch {
    return null;
  }
}

export function getSession(req: Request): Session | null {
  const header = req.headers.get('authorization') ?? '';
  if (!header.startsWith('Bearer ')) return null;
  return verifyToken(header.slice(7));
}
