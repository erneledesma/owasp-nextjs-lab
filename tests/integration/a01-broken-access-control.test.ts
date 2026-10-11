import { describe, it, expect } from 'vitest';
import { GET as orderRoute } from '@/app/api/orders/[id]/route';
import { GET as adminUsersRoute } from '@/app/api/admin/users/route';
import { login, me, register, request, USERS } from '../helpers';

const getOrder = (id: number, token?: string) =>
  orderRoute(request(`/api/orders/${id}`, { token }), { params: Promise.resolve({ id: String(id) }) });

describe('A01:2025 - Broken Access Control', () => {
  it('un usuario puede leer su propio pedido', async () => {
    const token = await login(USERS.ana.email, USERS.ana.password);
    const res = await getOrder(1, token);
    expect(res.status).toBe(200);
    expect((await res.json()).item).toContain('Notebook');
  });

  it('sin sesion no se puede leer ningun pedido', async () => {
    expect((await getOrder(1)).status).toBe(401);
  });

  it('IDOR: un usuario NO puede leer el pedido de otro cambiando el id', async () => {
    const token = await login(USERS.ana.email, USERS.ana.password);
    const res = await getOrder(3, token); // el pedido 3 es de bruno
    expect([403, 404]).toContain(res.status);
    expect(await res.text()).not.toContain('Belgrano 987');
  });

  it('el listado de usuarios es solo para el rol admin', async () => {
    const userToken = await login(USERS.ana.email, USERS.ana.password);
    const denied = await adminUsersRoute(request('/api/admin/users', { token: userToken }));
    expect(denied.status).toBe(403);
    expect(await denied.text()).not.toContain('bruno@lab.test');

    const adminToken = await login(USERS.admin.email, USERS.admin.password);
    const allowed = await adminUsersRoute(request('/api/admin/users', { token: adminToken }));
    expect(allowed.status).toBe(200);
  });

  it('mass assignment: no se puede elegir el rol al registrarse', async () => {
    const creds = { email: 'intruso@lab.test', password: 'Intruso#2026-Largo!' };
    const res = await register({ ...creds, role: 'admin' });
    expect(res.status).toBe(201);

    const token = await login(creds.email, creds.password);
    expect((await (await me(token)).json()).role).toBe('user');
  });
});
