import { getDb } from '@/lib/db';
import { hashPassword } from '@/lib/crypto';
import { json } from '@/lib/http';

// A07 - Politica minima de contraseñas: longitud + lista de claves comunes.
// (OWASP ASVS prioriza la longitud y el chequeo contra claves filtradas por sobre
// las reglas de composicion. En produccion: lista grande o servicio tipo HIBP.)
const MIN_LENGTH = 12;
const COMMON = new Set(['password', '123456', '12345678', 'qwerty', 'password123', 'contraseña', 'admin123']);

function passwordProblem(password: string): string | null {
  if (password.length < MIN_LENGTH) return `La contraseña debe tener al menos ${MIN_LENGTH} caracteres`;
  if (password.length > 128) return 'La contraseña es demasiado larga';
  if (COMMON.has(password.toLowerCase())) return 'La contraseña es demasiado comun';
  return null;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { email, password } = body;
  if (typeof email !== 'string' || typeof password !== 'string' || !email.includes('@')) {
    return json({ error: 'email y password son obligatorios' }, 400);
  }

  const problem = passwordProblem(password);
  if (problem) return json({ error: problem }, 400);

  // A01 - El rol lo decide el servidor: se ignora cualquier "role" que venga en el body.
  const role = 'user';
  try {
    const r = getDb()
      .prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)')
      .run(email, hashPassword(password), role);
    return json({ id: Number(r.lastInsertRowid), email, role }, 201);
  } catch {
    return json({ error: 'No se pudo registrar' }, 409);
  }
}
