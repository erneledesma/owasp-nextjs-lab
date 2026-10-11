# OWASP Top 10:2025 — Laboratorio práctico en Next.js

Aplicación Next.js (App Router, TypeScript) **vulnerable a propósito**. Cada vulnerabilidad tiene
tests de integración que hoy fallan. La práctica consiste en corregir el código hasta que
`npm test` quede en verde.

> No desplegar esta aplicación. Es material de práctica.

## Requisitos

- Node.js **22.13 o superior** (usa el módulo nativo `node:sqlite`; no hay base de datos que instalar)

## Puesta en marcha

```bash
npm install
cp .env.example .env.local      # y completar SESSION_SECRET (lo vas a necesitar en el reto A04)
npm test                        # estado inicial: 16 tests fallan, 7 pasan
npm run dev                     # opcional: explorar la app en http://localhost:3000
```

## Los 5 retos

Referencia: [OWASP Top 10:2025](https://owasp.org/Top10/2025/).

| Reto | Categoría OWASP | Qué está mal | Dónde mirar | Comando |
|------|-----------------|--------------|-------------|---------|
| 1 | **A01** Broken Access Control | IDOR en pedidos, endpoint admin sin control de rol, rol elegible al registrarse | `src/app/api/orders/[id]/route.ts`, `src/app/api/admin/users/route.ts`, `src/app/api/auth/register/route.ts` | `npm run test:a01` |
| 2 | **A02** Security Misconfiguration | Sin cabeceras de seguridad, `X-Powered-By` activo, endpoint `/api/debug` que expone el entorno, CORS `*` | `next.config.ts`, `src/app/api/debug/route.ts`, `src/lib/http.ts` | `npm run test:a02` |
| 3 | **A04** Cryptographic Failures | Contraseñas con MD5 sin sal, secreto de firma escrito en el código | `src/lib/crypto.ts`, `src/lib/auth.ts` | `npm run test:a04` |
| 4 | **A05** Injection | SQL armado por concatenación en la búsqueda | `src/app/api/products/route.ts` | `npm run test:a05` |
| 5 | **A07** Authentication Failures | Enumeración de usuarios, sin límite de intentos, contraseñas débiles aceptadas | `src/app/api/auth/login/route.ts`, `src/app/api/auth/register/route.ts` | `npm run test:a07` |

Los archivos vulnerables están marcados con un comentario `RETO Axx`.

### Por qué estas cinco

A01, A02, A04 y A05 están entre los cinco primeros puestos del Top 10:2025. El puesto 3
(A03 Software Supply Chain Failures) trata de dependencias y pipeline, y no se puede ejercitar
con tests sobre el código de la app; se reemplazó por A07, que sí se presta a este formato.

## Cómo trabajar cada reto

1. Ejecutar el comando del reto y leer qué afirma cada test que falla (`tests/integration/`).
2. Reproducir el ataque a mano si se quiere verlo (ejemplos abajo).
3. Corregir el código de `src/` o `next.config.ts`. **No modificar los tests.**
4. Repetir hasta que el reto quede en verde, y al final correr `npm test` completo.

Los tests llaman a los Route Handlers con objetos `Request` reales, así que recorren
ruta → autenticación → base de datos sin necesidad de levantar el servidor. Cada archivo de
test arranca con una base en memoria recién sembrada.

### Reglas que los tests esperan

- **A01**: pedido ajeno → `403` o `404`; `/api/admin/users` con rol `user` → `403`; el registro siempre crea rol `user`.
- **A02**: `poweredByHeader: false`; `headers()` con una regla para `/:path*` que incluya
  `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security`, `Content-Security-Policy`
  (con `default-src 'self'`) y protección anti-framing; `/api/debug` borrado o respondiendo `404`;
  sin `Access-Control-Allow-Origin: *`.
- **A04**: hash lento con sal por usuario (scrypt, Argon2id o bcrypt); el secreto se lee de
  `process.env.SESSION_SECRET`.
- **A05**: consulta parametrizada; los payloads devuelven `200` con `[]`.
- **A07**: usuario inexistente y clave incorrecta responden igual (`401`, mismo cuerpo);
  al sexto intento tras 5 fallos (misma IP + email) → `429` con cabecera `Retry-After`;
  el registro rechaza `123456`, `abc` y `password` con `400`.

### Ataques para probar a mano (con `npm run dev`)

```bash
# Login como ana
TOKEN=$(curl -s localhost:3000/api/auth/login -H 'content-type: application/json' \
  -d '{"email":"ana@lab.test","password":"Ana#2026-Segura!"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')

# A01 - leer el pedido de bruno
curl -s localhost:3000/api/orders/3 -H "authorization: Bearer $TOKEN"

# A02 - variables de entorno expuestas
curl -s localhost:3000/api/debug

# A05 - volcar usuarios y hashes por UNION
curl -s -G localhost:3000/api/products \
  --data-urlencode "search=zzz' UNION SELECT id, email, password_hash, 0, 1 FROM users --"
```

Usuarios de prueba: `src/lib/db.ts`.

## Solución de referencia

La carpeta `solucion/` tiene una resolución comentada de los cinco retos. Para aplicarla
(sobrescribe los archivos de `src/` y `next.config.ts`):

```bash
git init && git add -A && git commit -m "estado inicial"   # para poder volver atrás
npm run solucion
npm test        # 23 de 23 en verde
```

## Opcional: escaneo con ZAP

Los tests cubren la lógica; un escáner dinámico sirve para ver el reto A02 desde afuera.
Con la app levantada (`npm run build && npm start`):

```bash
docker run --rm -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t http://host.docker.internal:3000
```

Antes de corregir A02 reporta las cabeceras faltantes; después, no. (ZAP nació como proyecto
OWASP y hoy se mantiene fuera de la fundación; este comando no forma parte de la suite automatizada.)
