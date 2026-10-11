import { createHmac, timingSafeEqual } from 'node:crypto';

export type Session = { sub: number; email: string; role: string };

const TTL_SECONDS = 60 * 60; // 1 hora

// A04 - El secreto sale del entorno (nunca del repositorio) y se exige una longitud minima.
// Se lee en cada uso para que la app falle de forma explicita si falta.
function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error('SESSION_SECRET no esta definido o tiene menos de 32 caracteres');
  }
  return s;
}

const b64 = (s: string) => Buffer.from(s).toString('base64url');
const sign = (data: string) => createHmac('sha256', secret()).update(data).digest('base64url');

export function signToken(session: Session): string {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const payload = b64(JSON.stringify({ ...session, exp }));
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string): Session | null {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (typeof data.exp !== 'number' || data.exp < Date.now() / 1000) return null;
    return { sub: data.sub, email: data.email, role: data.role };
  } catch {
    return null;
  }
}

export function getSession(req: Request): Session | null {
  const header = req.headers.get('authorization') ?? '';
  if (!header.startsWith('Bearer ')) return null;
  return verifyToken(header.slice(7));
}
