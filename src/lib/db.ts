import { DatabaseSync } from 'node:sqlite';
import { hashPassword } from './crypto';

// Base SQLite en memoria (modulo nativo de Node, sin dependencias).
// Se guarda en globalThis para sobrevivir al hot-reload de `next dev`.
const g = globalThis as unknown as { __labDb?: DatabaseSync };

export const SEED_USERS = [
  { email: 'admin@lab.test', password: 'Admin#2026-Lab!', role: 'admin' },
  { email: 'ana@lab.test', password: 'Ana#2026-Segura!', role: 'user' },
  { email: 'bruno@lab.test', password: 'Bruno#2026-Segura!', role: 'user' },
  { email: 'carla@lab.test', password: 'Carla#2026-Segura!', role: 'user' },
] as const;

function seed(db: DatabaseSync): DatabaseSync {
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user'
    );
    CREATE TABLE orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item TEXT NOT NULL,
      total REAL NOT NULL,
      address TEXT NOT NULL
    );
    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      published INTEGER NOT NULL DEFAULT 1
    );
  `);

  const insUser = db.prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)');
  for (const u of SEED_USERS) insUser.run(u.email, hashPassword(u.password), u.role);

  const insOrder = db.prepare('INSERT INTO orders (user_id, item, total, address) VALUES (?, ?, ?, ?)');
  insOrder.run(2, 'Notebook 14"', 1250000, 'Av. Colon 1234, Cordoba'); // id 1 -> ana
  insOrder.run(2, 'Mouse inalambrico', 35000, 'Av. Colon 1234, Cordoba'); // id 2 -> ana
  insOrder.run(3, 'Monitor 27"', 480000, 'Belgrano 987, Rosario'); // id 3 -> bruno

  const insProd = db.prepare('INSERT INTO products (name, description, price, published) VALUES (?, ?, ?, ?)');
  insProd.run('Notebook 14"', 'Notebook liviana para trabajo', 1250000, 1);
  insProd.run('Notebook gamer 16"', 'Notebook con placa dedicada', 2890000, 1);
  insProd.run('Mouse inalambrico', 'Mouse optico 2.4GHz', 35000, 1);
  insProd.run('Monitor 27"', 'Monitor IPS QHD', 480000, 1);
  insProd.run('Prototipo secreto X', 'Producto no publicado: no debe verse', 9999999, 0);

  return db;
}

export function getDb(): DatabaseSync {
  if (!g.__labDb) g.__labDb = seed(new DatabaseSync(':memory:'));
  return g.__labDb;
}
