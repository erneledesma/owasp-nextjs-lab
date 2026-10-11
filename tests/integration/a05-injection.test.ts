import { describe, it, expect } from 'vitest';
import { GET as productsRoute } from '@/app/api/products/route';
import { request } from '../helpers';

const search = (q: string) => productsRoute(request(`/api/products?search=${encodeURIComponent(q)}`));

describe('A05:2025 - Injection (SQL)', () => {
  it('la busqueda normal devuelve los productos publicados que coinciden', async () => {
    const res = await search('Notebook');
    expect(res.status).toBe(200);
    const items = await res.json();
    expect(items).toHaveLength(2);
  });

  it("un payload booleano (' OR 1=1) no devuelve productos no publicados", async () => {
    const res = await search("%' OR 1=1 --");
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).not.toContain('Prototipo secreto');
    expect(JSON.parse(body)).toEqual([]);
  });

  it('un payload UNION no extrae usuarios ni hashes de la base', async () => {
    const res = await search("zzz' UNION SELECT id, email, password_hash, 0, 1 FROM users --");
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).not.toContain('@lab.test');
    expect(JSON.parse(body)).toEqual([]);
  });

  it('una comilla suelta no rompe la consulta ni filtra el SQL', async () => {
    const res = await search("'");
    expect(res.status).toBe(200);
    expect(await res.text()).not.toMatch(/SELECT|syntax/i);
  });
});
