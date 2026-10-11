const retos = [
  ['A01', 'Broken Access Control', 'GET /api/orders/3 logueado como ana · GET /api/admin/users · POST /api/auth/register con "role":"admin"'],
  ['A02', 'Security Misconfiguration', 'GET /api/debug · cabeceras de respuesta · CORS'],
  ['A04', 'Cryptographic Failures', 'hash de contraseñas en src/lib/crypto.ts · secreto en src/lib/auth.ts'],
  ['A05', 'Injection', "GET /api/products?search=%' OR 1=1 --"],
  ['A07', 'Authentication Failures', 'POST /api/auth/login (enumeracion y fuerza bruta) · registro con clave debil'],
];

export default function Home() {
  return (
    <main>
      <h1>OWASP Top 10:2025 — Laboratorio Next.js</h1>
      <p>
        Esta aplicacion es vulnerable a proposito. Ejecuta <code>npm test</code>, lee los tests que fallan y
        corrige el codigo hasta dejarlos en verde. No la despliegues.
      </p>
      <table cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%' }}>
        <tbody>
          {retos.map(([id, nombre, pista]) => (
            <tr key={id} style={{ borderTop: '1px solid #ccc', verticalAlign: 'top' }}>
              <td><strong>{id}</strong></td>
              <td>{nombre}</td>
              <td><code>{pista}</code></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Usuarios de prueba: ver <code>src/lib/db.ts</code>.</p>
    </main>
  );
}
