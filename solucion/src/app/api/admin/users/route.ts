import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { json } from '@/lib/http';

export async function GET(req: Request) {
  const session = getSession(req);
  if (!session) return json({ error: 'No autenticado' }, 401);
  // A01 - Denegar por defecto: solo el rol admin pasa.
  if (session.role !== 'admin') return json({ error: 'No autorizado' }, 403);

  const users = getDb().prepare('SELECT id, email, role FROM users').all();
  return json(users);
}
