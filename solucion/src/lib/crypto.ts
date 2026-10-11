import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// A04 - scrypt (funcion de derivacion lenta y con uso intensivo de memoria) + sal aleatoria por usuario.
// Formato guardado: scrypt$<sal hex>$<hash hex>
// Alternativas equivalentes recomendadas por OWASP: Argon2id o bcrypt.
const KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEYLEN);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split('$');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return timingSafeEqual(expected, actual);
}
