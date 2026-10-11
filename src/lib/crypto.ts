import { createHash } from 'node:crypto';

// RETO A04 (Cryptographic Failures)
// MD5 sin sal: rapido de romper por fuerza bruta y vulnerable a tablas rainbow.
// Dos usuarios con la misma clave terminan con el mismo hash.
export function hashPassword(password: string): string {
  return createHash('md5').update(password).digest('hex');
}

export function verifyPassword(password: string, stored: string): boolean {
  return hashPassword(password) === stored;
}
