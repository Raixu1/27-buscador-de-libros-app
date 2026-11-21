#!/usr/bin/env node
// Guardia de seguridad para la IA (hook PreToolUse de Kiro).
//  - Bloquea (exit 2) leer/escribir .env*, claves, keystores y credenciales.
//  - Bloquea rutas fuera de la carpeta del proyecto.
//  - Pide permiso (ask) para acciones con efecto fuera de la máquina.
import path from "node:path";
import { pathToFileURL } from "node:url";

const SECRET_PATTERNS = [
  /(^|[\\/\s"'=])\.env(?!\.example)(\.[\w.-]*)?($|[\\/\s"'])/i,
  /\.(pem|key|p12|pfx|jks|keystore)($|[\s"'])/i,
  /service[-_]?account[\w.-]*\.json/i,
  /firebase-adminsdk[\w.-]*\.json/i,
  /(^|[\\/\s"'])id_(rsa|ed25519)/i,
  /(^|[\\/\s"'])credentials(\.json)?($|[\s"'])/i,
  /google-services\.json/i,
];

const EXTERNAL_EFFECT = [
  /\bgit\s+push\b/i,
  /\bvercel\b/i,
  /\beas\s+(build|submit|update)\b/i,
  /\bnpm\s+publish\b/i,
  /\b(curl|wget|Invoke-WebRequest|iwr|Invoke-RestMethod|irm)\b/i,
  /\bgh\s+(repo|release|pr)\b/i,
];

// Campos que son contenido de archivos (no rutas ni comandos): no se analizan como rutas.
const CONTENT_KEYS = new Set(["text", "content", "newStr", "oldStr", "prompt"]);

function* strings(value, key = "") {
  if (typeof value === "string") {
    if (!CONTENT_KEYS.has(key)) yield value;
  } else if (Array.isArray(value)) {
    for (const v of value) yield* strings(v, key);
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) yield* strings(v, k);
  }
}

function pathTokens(text) {
  return text
    .split(/[\s"'`;|&<>()=,]+/)
    .filter((t) => /^(?:[a-zA-Z]:[\\/]|[\\/]|~|\.\.(?:[\\/]|$))/.test(t) || /(?:^|[\\/])\.\.(?:[\\/]|$)/.test(t));
}

/**
 * ¿La ruta queda fuera del proyecto? Funciona igual en Windows y en Linux (CI):
 * las barras invertidas se tratan como separadores y "C:\..." siempre es absoluta.
 * `sistema` permite probar el comportamiento de Linux desde Windows.
 */
export function fueraDelProyecto(token, root, sistema = process.platform === "win32" ? "win32" : "posix") {
  if (token.startsWith("~")) return true;
  const p = path[sistema];
  const norm = token.replace(/\\/g, "/");
  if (/^[a-zA-Z]:\//.test(norm) && sistema === "posix") return true;
  const rel = p.relative(root, p.resolve(root, norm));
  return rel.startsWith("..") || p.isAbsolute(rel);
}

/** @returns {{decision:"allow"|"deny"|"ask", reason?:string}} */
export function evaluate(toolInput, root) {
  const values = [...strings(toolInput)];
  for (const value of values) {
    if (SECRET_PATTERNS.some((re) => re.test(value))) {
      return { decision: "deny", reason: "Acceso a secretos bloqueado (.env, claves, credenciales, keystores)." };
    }
  }
  const rootSource = root
    .split(/[\\/]/)
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("[\\\\/]");
  const rootRe = new RegExp(rootSource, "gi");
  for (const raw of values) {
    // La ruta del proyecto puede contener espacios: se reemplaza por "." antes de tokenizar.
    const value = raw.replace(rootRe, ".");
    for (const token of pathTokens(value)) {
      if (fueraDelProyecto(token, root)) {
        return { decision: "deny", reason: `Ruta fuera de la carpeta del proyecto: ${token}` };
      }
    }
  }
  for (const value of values) {
    if (EXTERNAL_EFFECT.some((re) => re.test(value))) {
      return { decision: "ask", reason: "Acción con efecto fuera de su máquina: requiere permiso." };
    }
  }
  return { decision: "allow" };
}

async function main() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  let event = {};
  try {
    event = JSON.parse(raw || "{}");
  } catch {
    event = {};
  }
  const input = event.tool_input ?? event.toolInput ?? event.input ?? event;
  const { decision, reason } = evaluate(input, process.cwd());
  if (decision === "deny") {
    process.stderr.write(`BLOQUEADO: ${reason}\n`);
    process.exit(2);
  }
  if (decision === "ask") {
    const salida = { hookSpecificOutput: { permissionDecision: "ask", permissionDecisionReason: reason } };
    process.stdout.write(`${JSON.stringify(salida)}\n`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
