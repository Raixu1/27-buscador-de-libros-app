# Instrucciones para asistentes de IA

Las reglas completas están en [.kiro/steering/reglas-proyecto.md](.kiro/steering/reglas-proyecto.md). Léalas primero.

Resumen: no leer `.env*`, claves ni credenciales; no salir de esta carpeta; pedir permiso antes de acciones con efecto externo (push, EAS, red); ejecutar `npm run check` antes de dar una tarea por terminada.
La restricción se hace cumplir con `ia/guard.mjs` (hook PreToolUse en `.kiro/hooks/`) y se demuestra con `npm run test:ia`.
