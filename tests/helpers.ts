// Utilidades para invocar los Route Handlers de Next.js con objetos Request reales,
// recorriendo ruta + autenticacion + base de datos (sin levantar el servidor).
import { POST as loginRoute } from '@/app/api/auth/login/route';
import { POST as registerRoute } from '@/app/api/auth/register/route';
import { GET as meRoute } from '@/app/api/me/route';

const BASE = 'http://localhost:3000';

type Opts = { method?: string; token?: string; body?: unknown; ip?: string; origin?: string };

export function request(path: string, opts: Opts = {}): Request {
  const headers = new Headers();
  if (opts.token) headers.set('authorization', `Bearer ${opts.token}`);
  if (opts.ip) headers.set('x-forwarded-for', opts.ip);
  if (opts.origin) headers.set('origin', opts.origin);
  if (opts.body !== undefined) headers.set('content-type', 'application/json');
  return new Request(BASE + path, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
}

export function tryLogin(email: string, password: string, ip = '10.0.0.1'): Promise<Response> {
  return loginRoute(request('/api/auth/login', { method: 'POST', body: { email, password }, ip }));
}

export async function login(email: string, password: string, ip = '10.0.0.1'): Promise<string> {
  const res = await tryLogin(email, password, ip);
  if (res.status !== 200) throw new Error(`Login de ${email} fallo con ${res.status}`);
  return (await res.json()).token;
}

export function register(body: Record<string, unknown>, ip = '10.0.0.2'): Promise<Response> {
  return registerRoute(request('/api/auth/register', { method: 'POST', body, ip }));
}

export function me(token: string): Promise<Response> {
  return meRoute(request('/api/me', { token }));
}

export const USERS = {
  admin: { email: 'admin@lab.test', password: 'Admin#2026-Lab!' },
  ana: { email: 'ana@lab.test', password: 'Ana#2026-Segura!' },
  bruno: { email: 'bruno@lab.test', password: 'Bruno#2026-Segura!' },
  carla: { email: 'carla@lab.test', password: 'Carla#2026-Segura!' },
};
