// A02 - Sin cabeceras CORS: la API solo la consume el propio frontend (mismo origen).
// Si algun dia hace falta CORS, usar una lista explicita de origenes permitidos.
export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}
