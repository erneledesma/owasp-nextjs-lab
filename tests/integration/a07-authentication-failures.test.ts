import { describe, it, expect } from 'vitest';
import { register, tryLogin, USERS } from '../helpers';

describe('A07:2025 - Authentication Failures', () => {
  it('no permite enumerar usuarios: misma respuesta si el email no existe o la clave es incorrecta', async () => {
    const inexistente = await tryLogin('nadie@lab.test', 'Cualquiera#2026!', '10.7.0.1');
    const claveMala = await tryLogin(USERS.ana.email, 'Cualquiera#2026!', '10.7.0.1');
    expect(inexistente.status).toBe(401);
    expect(claveMala.status).toBe(401);
    expect(await inexistente.json()).toEqual(await claveMala.json());
  });

  it('bloquea la fuerza bruta: tras 5 intentos fallidos responde 429 aunque la clave sea correcta', async () => {
    const ip = '10.7.0.2';
    for (let i = 0; i < 5; i++) {
      expect((await tryLogin(USERS.carla.email, `incorrecta-${i}`, ip)).status).toBe(401);
    }
    const res = await tryLogin(USERS.carla.email, USERS.carla.password, ip);
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toMatch(/^\d+$/);
  });

  it('el bloqueo no afecta a otros usuarios', async () => {
    expect((await tryLogin(USERS.bruno.email, USERS.bruno.password, '10.7.0.3')).status).toBe(200);
  });

  it('el registro rechaza contraseñas debiles', async () => {
    expect((await register({ email: 'debil1@lab.test', password: '123456' })).status).toBe(400);
    expect((await register({ email: 'debil2@lab.test', password: 'abc' })).status).toBe(400);
    expect((await register({ email: 'debil3@lab.test', password: 'password' })).status).toBe(400);
  });

  it('el registro acepta una contraseña robusta', async () => {
    expect((await register({ email: 'fuerte@lab.test', password: 'Frase-larga-y-unica-2026' })).status).toBe(201);
  });
});
