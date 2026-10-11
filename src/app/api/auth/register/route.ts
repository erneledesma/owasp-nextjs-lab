import { getDb } from '@/lib/db';
import { hashPassword } from '@/lib/crypto';
import { json } from '@/lib/http';

// RETO A07: acepta cualquier contraseña ("123456" incluida).
// RETO A01: toma el rol desde el body (mass assignment): cualquiera se registra como admin.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { email, password } = body;
  if (typeof email !== 'string' || typeof password !== 'string' || !email.includes('@')) {
    return json({ error: 'email y password son obligatorios' }, 400);
  }

  const role = typeof body.role === 'string' ? body.role : 'user';
  try {
    const r = getDb()
      .prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)')
      .run(email, hashPassword(password), role);
    return json({ id: Number(r.lastInsertRowid), email, role }, 201);
  } catch {
    return json({ error: 'No se pudo registrar' }, 409);
  }
}
