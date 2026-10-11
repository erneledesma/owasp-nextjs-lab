// A07 - Limitador de intentos de login en memoria (por IP + email).
// En produccion con varias replicas (por ejemplo pods en EKS) el estado debe ir a
// un almacen compartido como Redis; en memoria cada pod cuenta por separado.
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

type Entry = { failures: number; lockedUntil: number; firstAt: number };
const g = globalThis as unknown as { __labAttempts?: Map<string, Entry> };
const attempts = (g.__labAttempts ??= new Map());

export function clientKey(req: Request, email: string): string {
  // x-forwarded-for solo es confiable si lo fija un proxy propio (CloudFront, ALB, ingress).
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'desconocida';
  return `${ip}|${email.toLowerCase()}`;
}

/** Segundos restantes de bloqueo, o 0 si puede intentar. */
export function lockedFor(key: string): number {
  const e = attempts.get(key);
  if (!e) return 0;
  const now = Date.now();
  if (e.lockedUntil > now) return Math.ceil((e.lockedUntil - now) / 1000);
  if (now - e.firstAt > WINDOW_MS) attempts.delete(key);
  return 0;
}

export function recordFailure(key: string): void {
  const now = Date.now();
  const e = attempts.get(key) ?? { failures: 0, lockedUntil: 0, firstAt: now };
  e.failures += 1;
  if (e.failures >= MAX_FAILURES) e.lockedUntil = now + WINDOW_MS;
  attempts.set(key, e);
}

export function recordSuccess(key: string): void {
  attempts.delete(key);
}
