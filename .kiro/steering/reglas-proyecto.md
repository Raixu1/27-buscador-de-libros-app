# Reglas del proyecto para la IA · 27-buscador-de-libros-app

## Stack
Expo + React Native + TypeScript + Expo Router · SQLite local (`expo-sqlite`) · `expo-secure-store` para tokens · `react-native-gesture-handler` + `react-native-reanimated` · `expo-camera` y `expo-sensors` · Jest + `jest-expo` + React Native Testing Library.

## Comandos
- `npm start` · `npm run android`
- `npm run lint` · `npm run typecheck` · `npm test` · `npm run test:ia`
- `npm run check` ejecuta todo lo anterior. Debe pasar antes de cada commit.

## Estructura
- `app/`: solo rutas de Expo Router (pantallas finas).
- `src/db`: abrir SQLite y migraciones. `src/repositories`: SQL parametrizado. `src/services`: reglas de negocio y sincronización. `src/api`: cliente HTTP. `src/sensors`: hooks de sensores. `src/components`: UI reutilizable y accesible.
- `ia/`: guardia de seguridad, sus pruebas y la bitácora.

## Sí
- Toda acción de un gesto tiene un botón equivalente con `accessibilityLabel`.
- Llamar `isAvailableAsync()` antes de usar un sensor; pedir permisos solo al activar la función; cancelar suscripciones al salir.
- La app nunca se rompe si falta un sensor o un permiso.
- SQL siempre parametrizado. Escribir primero en SQLite (`pending = 1`) y sincronizar después.
- Separar la lógica (funciones puras) de la lectura de sensores para poder probarla.

## No
- No leer, imprimir, copiar ni crear `.env*`, claves, keystores ni credenciales (solo `.env.example`).
- No salir de la carpeta de este repositorio.
- No incluir `firebaseConfig` ni ninguna clave de servicio en la app. Todo `EXPO_PUBLIC_*` es público.
- No guardar tokens en `AsyncStorage`; solo `expo-secure-store`.
- No usar `localhost` ni HTTP sin cifrar en el código de producción.
- No usar `any`, `console.log` ni `@ts-ignore`.
- No ejecutar `git push`, `eas`, `npm publish`, `curl` ni similares sin permiso explícito del usuario.
- No agregar funciones fuera de los requisitos sin pedirlo.
