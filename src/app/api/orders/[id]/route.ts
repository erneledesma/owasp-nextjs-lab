import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { json } from '@/lib/http';

// RETO A01 (Broken Access Control) - IDOR
// Verifica que haya sesion, pero no que el pedido sea del usuario que lo pide:
// cambiando el id en la URL se leen pedidos (y direcciones) de otras personas.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = getSession(req);
  if (!session) return json({ error: 'No autenticado' }, 401);

  const { id } = await params;
  const order = getDb().prepare('SELECT * FROM orders WHERE id = ?').get(Number(id));
  if (!order) return json({ error: 'Pedido no encontrado' }, 404);

  return json(order);
}
