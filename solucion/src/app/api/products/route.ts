import { getDb } from '@/lib/db';
import { json } from '@/lib/http';

export async function GET(req: Request) {
  const search = (new URL(req.url).searchParams.get('search') ?? '').slice(0, 100);

  // A05 - Consulta parametrizada: el texto viaja como dato, nunca como parte del SQL.
  // Ademas se escapan los comodines de LIKE para que "%" y "_" se busquen literalmente.
  const pattern = `%${search.replace(/[\\%_]/g, '\\$&')}%`;

  try {
    const rows = getDb()
      .prepare(
        "SELECT id, name, description, price FROM products WHERE published = 1 AND name LIKE ? ESCAPE '\\'",
      )
      .all(pattern);
    return json(rows);
  } catch (e) {
    console.error('Error en busqueda de productos', e); // el detalle queda en el log, no en la respuesta
    return json({ error: 'Error interno' }, 500);
  }
}
