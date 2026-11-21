# IA en este repositorio · índice

Configuración y evidencias del uso de IA (sección 14 y hojas de configuración de IA). El otro repositorio del proyecto
(`27-buscador-de-libros-api`) tiene la misma estructura.

## Configuración

| Archivo                                                                                                            | Qué es                                                                |
| ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| [`AGENTS.md`](AGENTS.md)                                                                                           | Instrucciones para cualquier asistente de IA (resumen)                |
| [`.kiro/steering/reglas-proyecto.md`](.kiro/steering/reglas-proyecto.md)                                           | Reglas completas: stack, comandos, estructura, calidad, lo prohibido  |
| [`.kiro/hooks/guardia-seguridad.json`](.kiro/hooks/guardia-seguridad.json)                                         | Hook PreToolUse que ejecuta la guardia                                |
| [`ia/guard.mjs`](ia/guard.mjs)                                                                                     | La guardia: deny / ask / allow                                        |
| [`eslint.config.mjs`](eslint.config.mjs), [`.prettierrc.json`](.prettierrc.json), [`.editorconfig`](.editorconfig) | Calidad automática                                                    |
| [`.husky/`](.husky), [`.github/workflows/ci.yml`](.github/workflows/ci.yml)                                        | Hooks de Git y CI                                                     |
| [`.github/pull_request_template.md`](.github/pull_request_template.md)                                             | Plantilla de PR (qué generó la IA, si se entendió, pruebas, secretos) |

## Evidencias

| Archivo                                                                                                                                                 | Contenido                                                      | Estado                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------- |
| [`ia/CONFIGURACION.md`](ia/CONFIGURACION.md)                                                                                                            | Qué riesgo cubre cada barrera, sus límites y los ajustes       | ✅                                                    |
| [`ia/EVIDENCIA-CHECK.md`](ia/EVIDENCIA-CHECK.md)                                                                                                        | Salida de `npm run check`, cobertura y enlace a la CI en verde | ✅                                                    |
| [`ia/RETOS.md`](ia/RETOS.md)                                                                                                                            | Retos 1 y 7 con evidencia y cómo reproducirlos                 | ✅ (falta la demo en vivo del reto 1)                 |
| [`ia/INFORME-INYECCION.md`](ia/INFORME-INYECCION.md)                                                                                                    | Reto 7: tres ataques y cómo se frenan                          | ✅                                                    |
| [`ia/PRUEBAS-CONTENCION.md`](ia/PRUEBAS-CONTENCION.md)                                                                                                  | Las 10 pruebas de contención en vivo                           | ⚠️ Plantilla: faltan resultados y capturas del equipo |
| [`ia/capturas/`](ia/capturas)                                                                                                                           | Capturas de las pruebas en vivo                                | ⚠️ Vacía                                              |
| [`ia/BITACORA.md`](ia/BITACORA.md)                                                                                                                      | Propósito, evidencia, validación y decisión de cada uso de IA  | ⚠️ Faltan los casos redactados por el equipo          |
| Pruebas: [`ia/guard.test.mjs`](ia/guard.test.mjs), [`ia/contencion.test.mjs`](ia/contencion.test.mjs), [`ia/inyeccion.test.mjs`](ia/inyeccion.test.mjs) | 24 pruebas de la guardia (`npm run test:ia`)                   | ✅                                                    |

## Cómo reproducir

```bash
npm ci --ignore-scripts && npx husky   # instala y activa los hooks
npm run check                          # tipos, lint, formato, pruebas con cobertura y guardia
npm run test:ia                        # solo la guardia
```

## Primer commit

El historial se puede revisar con `git show --stat a55bcdf`.

| Lo que pide la hoja                    | ¿Está en el primer commit?                                                                      |
| -------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `AGENTS.md`                            | ✅                                                                                              |
| Configuración de la IA (hook y reglas) | ✅                                                                                              |
| `.gitignore`                           | ✅                                                                                              |
| `env.example`                          | ❌ estaba como `.env.example` (nombre anterior); se agregó después                              |
| Scripts de calidad                     | ⚠️ `eslint.config.js` sí; `package.json` (scripts `check`, `lint`) llegó en el commit siguiente |

No se reescribió la historia: hacerlo exige `git push --force`, que la propia guardia prohíbe. Los commits posteriores
muestran cómo se completó.

## Pendiente del equipo

1. Abrir este repo **como carpeta raíz** del IDE y ejecutar las 10 pruebas de `ia/PRUEBAS-CONTENCION.md` con capturas.
2. Borrar del PC el JSON de la cuenta de servicio de Firebase (Vercel ya lo tiene).
3. Redactar en la bitácora, con sus palabras, los casos en que corrigieron a la IA.
4. Preparar la explicación línea por línea de un fragmento generado con IA.
