import { getSession } from '@/lib/auth';
import { json } from '@/lib/http';

export async function GET(req: Request) {
  const session = getSession(req);
  if (!session) return json({ error: 'No autenticado' }, 401);
  return json({ id: session.sub, email: session.email, role: session.role });
}
