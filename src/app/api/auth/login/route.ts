import { getDb } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { verifyPassword } from '@/lib/crypto';
import { json } from '@/lib/http';

type UserRow = { id: number; email: string; password_hash: string; role: string };

// RETO A07 (Authentication Failures)
//  - Responde distinto si el usuario no existe o si la clave es incorrecta
//    (permite enumerar cuentas validas).
//  - Intentos ilimitados: se puede probar claves por fuerza bruta.
export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  if (typeof email !== 'string' || typeof password !== 'string') {
    return json({ error: 'email y password son obligatorios' }, 400);
  }

  const user = getDb().prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;
  if (!user) return json({ error: 'El usuario no existe' }, 404);
  if (!verifyPassword(password, user.password_hash)) {
    return json({ error: 'Contraseña incorrecta' }, 401);
  }

  return json({ token: signToken({ sub: user.id, email: user.email, role: user.role }) });
}
