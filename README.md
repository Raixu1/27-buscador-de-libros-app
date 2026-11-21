# 27 · Buscador de libros y lista de lectura (app móvil)

[![CI](https://github.com/Raixu1/27-buscador-de-libros-app/actions/workflows/ci.yml/badge.svg)](https://github.com/Raixu1/27-buscador-de-libros-app/actions/workflows/ci.yml)

- **APK (Android):** https://expo.dev/artifacts/eas/8_fz6ABfVI5DrzczINHDFkTGA-d1X0rDkcp_v0vtnpk.apk
- **Build en Expo:** https://expo.dev/accounts/rexei/projects/27-buscador-de-libros-app/builds/d413a860-8427-4428-9964-66de86c04ebb
- **API:** https://27-buscador-de-libros-api.vercel.app

Expo + React Native + TypeScript + Expo Router. Busca libros por título o por ISBN escaneado y arma una lista de lectura con estado, calificación y notas. La lista vive en SQLite y funciona sin conexión; se sincroniza con la API (`27-buscador-de-libros-api`).

> La app **no contiene ninguna credencial**. Solo conoce la URL pública de la API (`EXPO_PUBLIC_API_URL`) y los tokens de sesión del usuario, guardados en `expo-secure-store`.

## Pantallas

| Ruta              | Contenido                                                                      |
| ----------------- | ------------------------------------------------------------------------------ |
| `login`           | Iniciar sesión o crear cuenta                                                  |
| `(tabs)/index`    | Buscador con debounce, paginación y pull to refresh                            |
| `(tabs)/mi-lista` | Lista local, filtro por estado, estadística de leídos del año, libro aleatorio |
| `libro/[id]`      | Detalle con portada (zoom e inclinación), estado, calificación y nota          |
| `escaner`         | Escanear ISBN con la cámara o escribirlo                                       |

## Gestos y alternativas

| Gesto                         | Uso                               | Alternativa accesible        |
| ----------------------------- | --------------------------------- | ---------------------------- |
| Deslizar tarjeta a la derecha | Agregar a «Quiero leer»           | Botón «+ Quiero leer»        |
| Pulsación larga               | Vista previa de la sinopsis       | Botón «Sinopsis»             |
| Pellizco                      | Zoom de la portada                | Botones «Acercar» / «Alejar» |
| Pull to refresh               | Repetir la búsqueda / sincronizar | Botón «Reintentar»           |

## Sensores

| Capacidad       | Uso                                   | Alternativa             |
| --------------- | ------------------------------------- | ----------------------- |
| `expo-camera`   | Escanear ISBN (EAN-13)                | Escribir el ISBN        |
| `Accelerometer` | Sacudir = libro aleatorio de mi lista | Botón «Libro aleatorio» |
| `Gyroscope`     | Inclinación de la portada             | Portada estática        |

Se llama `isAvailableAsync()` antes de usar cada sensor, los permisos se piden solo al activar la función y las suscripciones se cancelan al salir. La lógica pura está en `src/sensors/logic.ts`.

## Estructura

```text
app/        rutas de Expo Router
src/db/ repositories/ services/ api/ sensors/ components/
__tests__/  Jest + jest-expo + React Native Testing Library
ia/         guardia de seguridad de la IA, evidencias y bitácora
```

## Desarrollo

```bash
npm install
cp env.example .env        # EXPO_PUBLIC_API_URL=https://<su-api>.vercel.app  (pública, no secreta)
npx expo start              # probar en un dispositivo físico (cámara y sensores)
npm run check               # tipos + lint + formato + pruebas con cobertura ≥ 80 % + guardia de IA
```

## APK con EAS Build

```bash
npm i -g eas-cli
eas login
eas init
# edite eas.json: EXPO_PUBLIC_API_URL con la URL real de la API (HTTPS)
eas build -p android --profile preview
```

Antes de entregar, busque secretos: `grep -r "firebaseConfig\|AIza\|PRIVATE KEY" app src` debe devolver vacío.

## Reglas de datos

- Búsqueda de mínimo 3 caracteres. Calificación 1–5 solo si el estado es «Leído». No se duplican libros.
- Se escribe primero en SQLite (`pending = 1`); el servicio de sincronización envía los pendientes y luego pide `?since=`. Gana la última escritura (`updated_at` del servidor).
- «Leídos este año» cuenta los libros en estado «Leído» cuya última modificación es del año en curso.

## Configuración de IA

Reglas en `AGENTS.md` y `.kiro/steering/`. Hook `PreToolUse` (`ia/guard.mjs`) que bloquea `.env*`/claves, bloquea rutas fuera del repo y pide permiso para acciones externas. Evidencia: `npm run test:ia`. Bitácora: `ia/BITACORA.md`.
Hooks de Git con Husky: al hacer commit, `lint-staged` formatea y revisa lo modificado; al hacer push corre `npm run check`. Se activan solos con `npm install`.

## Dependencias (por qué está cada una)

`package-lock.json` está versionado y la CI instala con `npm ci` (versiones exactas). Se quitaron los paquetes de la plantilla que no se usaban (`@expo/ui`, `expo-device`, `expo-glass-effect`, `expo-symbols`, `expo-web-browser`).

| Paquete                                                                                                   | Para qué                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `expo`, `react`, `react-native`                                                                           | Base de la app (Expo SDK).                                                                                                                                      |
| `expo-router`, `react-native-screens`, `react-native-safe-area-context`, `expo-linking`, `expo-constants` | Navegación por archivos; los cuatro últimos los exige `expo-router`.                                                                                            |
| `expo-sqlite`                                                                                             | Lista de lectura local, funciona sin conexión (RF-04).                                                                                                          |
| `expo-secure-store`                                                                                       | Guardar `token` y `refreshToken` cifrados (nunca en AsyncStorage).                                                                                              |
| `expo-camera`                                                                                             | Escanear el código de barras ISBN (RF-02).                                                                                                                      |
| `expo-sensors`                                                                                            | Acelerómetro (sacudir) y giroscopio (inclinación de la portada).                                                                                                |
| `expo-haptics`                                                                                            | Vibración breve al agregar o guardar.                                                                                                                           |
| `react-native-gesture-handler`, `react-native-reanimated`, `react-native-worklets`                        | Gestos (deslizar, pulsación larga, pellizco) y animaciones; `worklets` lo exige Reanimated 4.                                                                   |
| `expo-image`                                                                                              | Portadas con caché y transición.                                                                                                                                |
| `expo-linear-gradient`, `@expo/vector-icons`, `expo-font`                                                 | Diseño: degradados e iconos; `expo-font` lo exige `@expo/vector-icons`.                                                                                         |
| `expo-status-bar`, `expo-splash-screen`, `expo-system-ui`                                                 | Barra de estado, pantalla de carga y tema claro en Android.                                                                                                     |
| `react-dom`, `react-native-web`                                                                           | Vista previa del diseño en el navegador (`expo start --web`).                                                                                                   |
| `zod`                                                                                                     | Validar cada respuesta de la API antes de usarla o guardarla.                                                                                                   |
| `typescript`, `@types/*`                                                                                  | Tipado estricto.                                                                                                                                                |
| `jest`, `jest-expo`, `@testing-library/react-native`, `react-test-renderer`                               | Pruebas y cobertura (umbral 80 %); los pide la guía.                                                                                                            |
| `eslint` (9), `eslint-config-expo`, `eslint-import-resolver-typescript`                                   | Reglas de calidad; el resolver lo necesita `eslint-config-expo` para entender los alias `@/`. ESLint 9 porque los plugins del config aún no soportan ESLint 10. |
| `prettier`                                                                                                | Formato uniforme.                                                                                                                                               |
| `husky`, `lint-staged`                                                                                    | Hooks: formato y lint en el commit, `npm run check` en el push.                                                                                                 |
