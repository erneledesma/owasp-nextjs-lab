// Copia la solucion de referencia (carpeta solucion/) sobre el proyecto.
// Sobrescribe tus cambios: hace un commit antes si queres conservarlos.
import { cpSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
cpSync(`${root}solucion/next.config.ts`, `${root}next.config.ts`);
cpSync(`${root}solucion/src`, `${root}src`, { recursive: true });
console.log('Solucion aplicada. Ejecuta: npm test');
