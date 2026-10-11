// RETO A02 (Security Misconfiguration)
// CORS abierto a cualquier origen en todas las respuestas de la API, incluso las
// autenticadas. Nadie lo pidio: quedo de una prueba y nunca se quito.
export function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
    },
  });
}
