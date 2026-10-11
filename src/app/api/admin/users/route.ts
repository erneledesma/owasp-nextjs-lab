import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { json } from '@/lib/http';

// RETO A01 (Broken Access Control)
// Endpoint "de administracion" que solo pide estar logueado: falta el control de rol.
export async function GET(req: Request) {
  const session = getSession(req);
  if (!session) return json({ error: 'No autenticado' }, 401);

  const users = getDb().prepare('SELECT id, email, role FROM users').all();
  return json(users);
}
