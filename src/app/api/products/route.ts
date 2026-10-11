import { getDb } from '@/lib/db';
import { json } from '@/lib/http';

// RETO A05 (Injection) - SQL injection
// El texto de busqueda se concatena directo en la consulta.
export async function GET(req: Request) {
  const search = new URL(req.url).searchParams.get('search') ?? '';

  const sql =
    "SELECT id, name, description, price, published FROM products " +
    "WHERE published = 1 AND name LIKE '%" + search + "%'";

  try {
    return json(getDb().prepare(sql).all());
  } catch (e) {
    return json({ error: String(e), sql }, 500);
  }
}
