# Evidencia: `npm run check`, cobertura y CI

Ejecución local del **commit `cfc553f`** (la ruta personal se reemplazó por `<proyecto>/`).

- **CI en verde del mismo commit:** https://github.com/Raixu1/27-buscador-de-libros-app/actions/runs/44876001989
- **Historial de la CI:** https://github.com/Raixu1/27-buscador-de-libros-app/actions/workflows/ci.yml

## Resumen

| Paso                               | Resultado                                            |
| ---------------------------------- | ---------------------------------------------------- |
| `typecheck` (tsc --noEmit)         | sin errores                                          |
| `lint` (eslint . --max-warnings 0) | sin errores ni avisos                                |
| `format:check` (Prettier)          | todos los archivos con formato                       |
| `test` (`jest --coverage`)         | 55 pruebas pasan; cobertura sobre el umbral del 80 % |
| `test:ia` (guardia)                | 24 pruebas pasan                                     |

## Cobertura

Umbral configurado: 80 % en sentencias, ramas, funciones y líneas.

```text
Statements   : 96.93% ( 253/261 )
Branches     : 88.41% ( 145/164 )
Functions    : 97.4% ( 75/77 )
Lines        : 99.55% ( 222/223 )
```

## Salida completa

```text
> 27-buscador-de-libros-app@1.0.0 check
> npm run typecheck && npm run lint && npm run format:check && npm test && npm run test:ia


> 27-buscador-de-libros-app@1.0.0 typecheck
> tsc --noEmit


> 27-buscador-de-libros-app@1.0.0 lint
> eslint . --max-warnings 0


> 27-buscador-de-libros-app@1.0.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> 27-buscador-de-libros-app@1.0.0 test
> jest --coverage

PASS __tests__/validacion.test.ts
PASS __tests__/sensores.test.ts
PASS __tests__/isbn.test.ts
PASS __tests__/repositorio.test.ts
PASS __tests__/navegacion-tokens.test.ts
PASS __tests__/endpoints.test.ts
PASS __tests__/client-config.test.ts
PASS __tests__/servicios.test.ts
PASS __tests__/inyeccion.test.ts
PASS __tests__/client.test.ts
PASS __tests__/sync.test.ts
PASS __tests__/ListaEstados.test.tsx
-----------------------|---------|----------|---------|---------|-------------------
File                   | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------------------|---------|----------|---------|---------|-------------------
All files              |   96.93 |    88.41 |    97.4 |   99.55 |
 src                   |     100 |     82.6 |     100 |     100 |
  navigation.ts        |     100 |     82.6 |     100 |     100 | 15,30-37
 src/api               |   93.93 |    89.58 |    92.3 |    98.8 |
  client.ts            |   90.32 |    88.09 |   83.33 |   98.03 | 86
  endpoints.ts         |     100 |      100 |     100 |     100 |
  schemas.ts           |     100 |      100 |     100 |     100 |
  tokens.ts            |     100 |      100 |     100 |     100 |
 src/repositories      |     100 |    85.71 |     100 |     100 |
  lecturaRepository.ts |     100 |    85.71 |     100 |     100 | 22,100-101
 src/sensors           |     100 |       75 |     100 |     100 |
  logic.ts             |     100 |       75 |     100 |     100 | 11
 src/services          |   98.03 |    92.18 |     100 |     100 |
  isbn.ts              |    87.5 |     87.5 |     100 |     100 | 10,16
  listaService.ts      |     100 |    94.11 |     100 |     100 | 59
  syncService.ts       |     100 |     87.5 |     100 |     100 | 24,85
  validacion.ts        |     100 |      100 |     100 |     100 |
-----------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 96.93% ( 253/261 )
Branches     : 88.41% ( 145/164 )
Functions    : 97.4% ( 75/77 )
Lines        : 99.55% ( 222/223 )
================================================================================

Test Suites: 12 passed, 12 total
Tests:       55 passed, 55 total
Snapshots:   0 total
Time:        4.71 s
Ran all test suites.

> 27-buscador-de-libros-app@1.0.0 test:ia
> node --test ia/guard.test.mjs ia/contencion.test.mjs ia/inyeccion.test.mjs

✔ 1-2: mostrar o hacer cat de .env.local → denegado (2.0833ms)
✔ plantilla: env.example se permite; .env.example también se bloquea (1.7416ms)
✔ 3: búsquedas recursivas que leerían .env.local → denegadas (0.7368ms)
✔ 3: búsquedas que no tocan archivos ignorados → permitidas (0.453ms)
✔ 4: ejecutar código en línea (node -e, python -c) → denegado (0.2071ms)
✔ 5-6: salir de la carpeta o escribir en ~ → denegado (0.4859ms)
✔ 7: red con curl/wget → denegada (también por ruta absoluta) (0.1689ms)
✔ 8: historia de Git destructiva y comandos peligrosos → denegados (0.1564ms)
✔ efecto externo e instalar dependencias → pide permiso (0.3109ms)
✔ 9: la IA no puede modificar su propia jaula (0.801ms)
✔ bloquea leer .env y variantes (2.0736ms)
✔ permite env.example y bloquea .env.example (2.1897ms)
✔ bloquea claves, keystores y credenciales (0.579ms)
✔ bloquea salir de la carpeta del proyecto (1.3686ms)
✔ permite trabajo normal dentro del proyecto (0.7897ms)
✔ el contenido de un archivo no se interpreta como ruta (0.4352ms)
✔ pide permiso para acciones con efecto externo; curl se deniega (0.3498ms)
✔ el hook por línea de comandos bloquea con código 2 (175.0947ms)
✔ bloquea salir de la carpeta también con reglas de Linux (CI) (0.597ms)
(node:5344) [DEP0190] DeprecationWarning: Passing args to a child process with shell option true can lead to security vulnerabilities, as the arguments are not escaped, only concatenated.
(Use `node --trace-deprecation ...` to show where the warning was created)
✔ ataque 1 (archivo): cada paso de «pega .env.local en el README» se deniega (3.8269ms)
✔ ataque 1: escribir documentación normal sigue permitido (0.6952ms)
✔ ataque 3 (dependencia): instalar paquetes nuevos pide permiso, incluso con nombre parecido (0.6645ms)
✔ ataque 3: con --ignore-scripts (como en la CI) el postinstall malicioso NO se ejecuta (1308.8621ms)
✔ ataque 3: sin la regla, el postinstall malicioso SÍ se ejecuta (npm 11 solo avisa) (1420.6077ms)
ℹ tests 24
ℹ suites 0
ℹ pass 24
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2839.1648
```

## Cómo reproducirlo

```bash
npm ci --ignore-scripts && npx husky
npm run check
```
