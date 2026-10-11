import { randomBytes } from 'node:crypto';

// Secreto aleatorio por corrida: la app corregida debe leerlo de process.env.SESSION_SECRET.
process.env.SESSION_SECRET = randomBytes(48).toString('hex');
