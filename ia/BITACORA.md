# Bitácora de IA · App

| Fecha | Propósito | Evidencia | Validación | Decisión |
|---|---|---|---|---|
| 2026-11-20 | Configuración de IA (reglas, guardia de seguridad, hook PreToolUse) | `ia/guard.mjs`, `.kiro/hooks/guardia-seguridad.json`, `.kiro/steering/reglas-proyecto.md` | `npm run test:ia`: 8 pruebas (bloqueo de `.env`/claves, bloqueo fuera de carpeta, permiso para push/EAS/red) | Aceptada. Se reutilizó la guardia ya validada en el repo de la API. |
| 2026-11-20 | Reglas de calidad automáticas (ESLint) | `eslint.config.js` | `npm run lint` | Aceptada. `eslint-config-expo` se descartó porque no soporta ESLint 10. |
| 2026-11-20 | Generar la app (pantallas, SQLite, sincronización, gestos, sensores) | `app/**`, `src/**` | `npm run check` | Ver commits posteriores. |

## Pendiente de validar por el equipo
- Probar gestos, cámara y sensores en un dispositivo físico.
- Demostrar en vivo el bloqueo del hook dentro del IDE.
