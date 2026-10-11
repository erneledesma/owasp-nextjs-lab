// A02 - El endpoint de diagnostico no debe existir en la app.
// Lo mas limpio es borrar este archivo; aca se deja respondiendo 404 para que
// `npm run solucion` pueda sobrescribir la version vulnerable.
export async function GET() {
  return new Response(null, { status: 404 });
}
