import { describe, it, expect } from 'vitest';
import nextConfig from '../../next.config';
import { GET as meRoute } from '@/app/api/me/route';
import { login, request, USERS } from '../helpers';

async function globalHeaders(): Promise<Map<string, string>> {
  const rules = (await nextConfig.headers?.()) ?? [];
  const map = new Map<string, string>();
  for (const rule of rules) {
    // Solo cuentan las reglas que aplican a todas las rutas.
    if (!['/:path*', '/(.*)'].includes(rule.source)) continue;
    for (const h of rule.headers) map.set(h.key.toLowerCase(), h.value);
  }
  return map;
}

describe('A02:2025 - Security Misconfiguration', () => {
  it('no se anuncia el framework (X-Powered-By desactivado)', () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });

  it('next.config define cabeceras de seguridad para todas las rutas', async () => {
    const h = await globalHeaders();
    expect(h.get('x-content-type-options')).toBe('nosniff');
    expect(h.get('referrer-policy')).toMatch(/no-referrer|same-origin|strict-origin/);
    expect(h.get('strict-transport-security')).toMatch(/max-age=\d{8,}/);
    expect(h.get('content-security-policy')).toMatch(/default-src 'self'/);
    // Anti-clickjacking: X-Frame-Options o frame-ancestors en la CSP.
    const antiFraming =
      /DENY|SAMEORIGIN/i.test(h.get('x-frame-options') ?? '') ||
      /frame-ancestors/.test(h.get('content-security-policy') ?? '');
    expect(antiFraming).toBe(true);
  });

  it('el endpoint de diagnostico no esta disponible ni filtra el entorno', async () => {
    // Vale tanto borrar src/app/api/debug/route.ts como hacer que responda 404.
    const mod: any = await import('@/app/api/debug/route').catch(() => null);
    if (!mod?.GET) return;
    const res: Response = await mod.GET(request('/api/debug'));
    expect(res.status).toBe(404);
    expect(await res.text()).not.toContain(process.env.SESSION_SECRET!);
  });

  it('las respuestas autenticadas no habilitan CORS para cualquier origen', async () => {
    const token = await login(USERS.ana.email, USERS.ana.password);
    const res = await meRoute(request('/api/me', { token, origin: 'https://evil.example' }));
    const acao = res.headers.get('access-control-allow-origin');
    expect(acao).not.toBe('*');
    expect(acao).not.toBe('https://evil.example');
  });
});
