import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { json } from '@/lib/http';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = getSession(req);
  if (!session) return json({ error: 'No autenticado' }, 401);

  const { id } = await params;
  // A01 - La pertenencia se filtra en la propia consulta: el pedido debe ser del usuario
  // de la sesion. Se responde 404 (y no 403) para no confirmar que el id existe.
  const order = getDb()
    .prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?')
    .get(Number(id), session.sub);
  if (!order) return json({ error: 'Pedido no encontrado' }, 404);

  return json(order);
}
