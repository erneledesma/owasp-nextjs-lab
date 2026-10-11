import { getDb } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { hashPassword, verifyPassword } from '@/lib/crypto';
import { json } from '@/lib/http';
import { clientKey, lockedFor, recordFailure, recordSuccess } from '@/lib/rate-limit';

type UserRow = { id: number; email: string; password_hash: string; role: string };

// Hash de relleno: si el usuario no existe igual se ejecuta una verificacion,
// para que el tiempo de respuesta no delate que cuentas existen.
const DUMMY_HASH = hashPassword('relleno-para-igualar-tiempos');
const GENERIC = { error: 'Credenciales invalidas' };

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  if (typeof email !== 'string' || typeof password !== 'string') {
    return json({ error: 'email y password son obligatorios' }, 400);
  }

  // A07 - Bloqueo temporal tras varios fallos. Se evalua antes de mirar la clave.
  const key = clientKey(req, email);
  const wait = lockedFor(key);
  if (wait > 0) {
    return json({ error: 'Demasiados intentos. Proba mas tarde.' }, 429, { 'Retry-After': String(wait) });
  }

  const user = getDb().prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;
  const ok = verifyPassword(password, user?.password_hash ?? DUMMY_HASH) && !!user;

  // A07 - Mismo codigo y mismo mensaje exista o no el usuario.
  if (!ok || !user) {
    recordFailure(key);
    return json(GENERIC, 401);
  }

  recordSuccess(key);
  return json({ token: signToken({ sub: user.id, email: user.email, role: user.role }) });
}
