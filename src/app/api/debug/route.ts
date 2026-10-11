import { json } from '@/lib/http';

// RETO A02 (Security Misconfiguration)
// Endpoint de diagnostico que quedo publicado: expone variables de entorno
// (secretos incluidos) y versiones a cualquiera que lo llame.
export async function GET() {
  return json({
    node: process.version,
    cwd: process.cwd(),
    env: process.env,
  });
}
