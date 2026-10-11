import { describe, it, expect } from 'vitest';
import { createHash, createHmac } from 'node:crypto';
import { getDb } from '@/lib/db';
import { login, me, register, USERS } from '../helpers';

const md5 = (s: string) => createHash('md5').update(s).digest('hex');
const sha = (alg: string, s: string) => createHash(alg).update(s).digest('hex');
const storedHash = (email: string) =>
  (getDb().prepare('SELECT password_hash FROM users WHERE email = ?').get(email) as { password_hash: string })
    .password_hash;

describe('A04:2025 - Cryptographic Failures', () => {
  it('las contraseñas no se guardan con un hash rapido sin sal (MD5/SHA)', () => {
    const { email, password } = USERS.ana;
    const hash = storedHash(email);
    expect(hash).not.toBe(password);
    expect(hash).not.toBe(md5(password));
    expect(hash).not.toBe(sha('sha1', password));
    expect(hash).not.toBe(sha('sha256', password));
  });

  it('dos usuarios con la misma contraseña tienen hashes distintos (sal por usuario)', async () => {
    const password = 'Misma#Clave-2026-Larga!';
    expect((await register({ email: 'uno@lab.test', password })).status).toBe(201);
    expect((await register({ email: 'dos@lab.test', password })).status).toBe(201);
    expect(storedHash('uno@lab.test')).not.toBe(storedHash('dos@lab.test'));
  });

  it('el login sigue funcionando despues de cambiar el algoritmo', async () => {
    const token = await login(USERS.bruno.email, USERS.bruno.password);
    expect((await (await me(token)).json()).email).toBe(USERS.bruno.email);
  });

  it('un token fabricado con el secreto escrito en el codigo es rechazado', async () => {
    // El atacante conoce el formato del token y prueba el secreto "secret".
    const payload = Buffer.from(JSON.stringify({ sub: 1, email: 'admin@lab.test', role: 'admin' })).toString(
      'base64url',
    );
    const forged = `${payload}.${createHmac('sha256', 'secret').update(payload).digest('base64url')}`;
    expect((await me(forged)).status).toBe(401);
  });

  it('un token con el payload alterado es rechazado', async () => {
    const token = await login(USERS.ana.email, USERS.ana.password);
    const [, signature] = token.split('.');
    const payload = Buffer.from(JSON.stringify({ sub: 1, email: 'admin@lab.test', role: 'admin' })).toString(
      'base64url',
    );
    expect((await me(`${payload}.${signature}`)).status).toBe(401);
  });
});
