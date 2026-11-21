#!/usr/bin/env node
// Guardia de seguridad para la IA (hook PreToolUse de Kiro). Orden: deny → ask → allow.
//  - Deniega (exit 2): secretos (.env*, claves, credenciales), rutas fuera del proyecto, red (curl/wget),
//    historia de Git destructiva, código en línea (node -e), búsquedas recursivas, editar su propia configuración
//    y escribir en archivos contenido con formato de secreto (claves privadas, API keys, tokens).
//  - Pide permiso (ask): push, despliegues, publicar e instalar dependencias.
// Límite conocido: un script nuevo puede leer archivos sin que un patrón lo detecte. Por eso se combina
// con no tener secretos reales en el disco y, donde exista, con el sandbox del sistema operativo.
import path from "node:path";
import { pathToFileURL } from "node:url";

const SECRET_PATTERNS = [
  /(^|[\\/\s"'=])\.env(\.[\w.-]*)?($|[\\/\s"'])/i,
  /\.(pem|key|p12|pfx|jks|keystore)($|[\s"'])/i,
  /service[-_]?account[\w.-]*\.json/i,
  /firebase-adminsdk[\w.-]*\.json/i,
  /(^|[\\/\s"'])id_(rsa|ed25519)/i,
  /(^|[\\/\s"'])credentials(\.json)?($|[\s"'])/i,
  /google-services\.json/i,
];

/** Comandos que se deniegan siempre (no hay caso legítimo para que la IA los ejecute). */
const COMANDOS_DENEGADOS = [
  [/(^|[\s/\\])(curl|wget)(\.exe)?\b/i, "Red bloqueada (curl/wget)."],
  [/\b(Invoke-WebRequest|Invoke-RestMethod|iwr|irm)\b/i, "Red bloqueada (Invoke-WebRequest)."],
  [/\bgit\s+push\b.*(\s--force(-with-lease)?\b|\s-f\b)/i, "git push --force está prohibido."],
  [/\bgit\s+reset\b.*--hard\b/i, "git reset --hard está prohibido."],
  [/\bgit\s+clean\b.*-[a-z]*f/i, "git clean -f está prohibido."],
  [/\brm\s+-[a-z]*r[a-z]*f|\brm\s+-[a-z]*f[a-z]*r/i, "rm -rf está prohibido."],
  [/(^|[\s;&|])sudo\b/i, "sudo está prohibido."],
  [/\bvercel\s+env\s+pull\b/i, "vercel env pull bajaría secretos de producción al disco."],
  [
    /\b(node|deno|bun)\s+(-e|--eval|-p|--print)\b/i,
    "Ejecutar código en línea está prohibido: use un archivo revisable.",
  ],
  [/\bpython3?\s+-c\b/i, "Ejecutar código en línea está prohibido: use un archivo revisable."],
];

/** Búsquedas recursivas: leerían archivos ignorados como .env.local. `git grep` solo mira lo versionado. */
const BUSQUEDA_RECURSIVA = [
  /(^|[\s;&|])grep\s+(-\w*[rR]\w*|--recursive)\b/,
  /(^|[\s;&|])rg\s/,
  /\bfindstr\b.*\s\/s\b/i,
  /\bSelect-String\b.*-Recurse\b|-Recurse\b.*\|\s*Select-String\b/i,
];

const PEDIR_PERMISO = [
  /\bgit\s+push\b/i,
  /\bvercel\b/i,
  /\beas\s+(build|submit|update)\b/i,
  /\bnpm\s+publish\b/i,
  /\bgh\s+(repo|release|pr)\b/i,
  /\bnpm\s+(i|install|add)\b(?!\s*$)/i,
  /\bnpx\s+expo\s+install\b/i,
];

/** La propia jaula: la IA puede leerla, no modificarla. */
const CONFIG_PROTEGIDA = /(^|[\\/])(\.kiro|\.claude)([\\/]|$)|(^|[\\/])ia[\\/](guard|contencion)[\w.-]*\.mjs$/i;
const HERRAMIENTAS_ESCRITURA = /write|replace|append|delete|edit|relocate|rename|move/i;
const COMANDO_ESCRITURA =
  /\b(Set-Content|Add-Content|Out-File|Remove-Item|Move-Item|Copy-Item|New-Item|rm|mv|cp|del|tee|sed\s+-i)\b|>/i;

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

/** Formatos de secretos reales: nunca deben acabar en un archivo, aunque la IA los obtuviera por otra vía. */
const CONTENIDO_SECRETO = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\bAIza[0-9A-Za-z_-]{35}\b/,
  /\b(ghp|gho|github_pat)_[0-9A-Za-z_]{20,}/,
  /\bsk-[A-Za-z0-9]{20,}/,
];

const deny = (reason) => ({ decision: "deny", reason });

/** Textos que la IA quiere escribir (los campos de contenido no se analizan como rutas, pero sí aquí). */
function contenidos(toolInput) {
  return Object.entries(toolInput ?? {})
    .filter(([k, v]) => CONTENT_KEYS.has(k) && typeof v === "string")
    .map(([, v]) => v);
}

function revisarContenido(toolInput) {
  const hay = contenidos(toolInput).some((t) => CONTENIDO_SECRETO.some((re) => re.test(t)));
  return hay
    ? deny("El contenido parece un secreto (clave privada, API key o token): no se escribe en archivos.")
    : null;
}

function revisarSecretos(values) {
  const hay = values.some((v) => SECRET_PATTERNS.some((re) => re.test(v)));
  return hay ? deny("Acceso a secretos bloqueado (.env*, claves, credenciales, keystores).") : null;
}

function revisarComandos(values) {
  for (const value of values) {
    const regla = COMANDOS_DENEGADOS.find(([re]) => re.test(value));
    if (regla) return deny(regla[1]);
    if (BUSQUEDA_RECURSIVA.some((re) => re.test(value))) {
      return deny("Búsqueda recursiva bloqueada: leería archivos ignorados como .env.local. Use git grep.");
    }
  }
  return null;
}

function revisarRutas(values, root) {
  const rootSource = root
    .split(/[\\/]/)
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("[\\\\/]");
  const rootRe = new RegExp(rootSource, "gi");
  for (const raw of values) {
    // La ruta del proyecto puede contener espacios: se reemplaza por "." antes de tokenizar.
    const token = pathTokens(raw.replace(rootRe, ".")).find((t) => fueraDelProyecto(t, root));
    if (token) return deny(`Ruta fuera de la carpeta del proyecto: ${token}`);
  }
  return null;
}

function revisarJaula(values, toolName, toolInput) {
  const tocaJaula = values.some((v) => CONFIG_PROTEGIDA.test(v) || /(\.kiro|\.claude|ia[\\/]guard)/i.test(v));
  if (!tocaJaula) return null;
  const esEscritura =
    HERRAMIENTAS_ESCRITURA.test(toolName) ||
    Object.keys(toolInput ?? {}).some((k) => CONTENT_KEYS.has(k)) ||
    values.some((v) => COMANDO_ESCRITURA.test(v));
  return esEscritura ? deny("La configuración de la IA (.kiro, .claude, ia/guard) no se puede modificar.") : null;
}

/** @returns {{decision:"allow"|"deny"|"ask", reason?:string}} */
export function evaluate(toolInput, root, toolName = "") {
  const values = [...strings(toolInput)];
  const denegado =
    revisarSecretos(values) ??
    revisarComandos(values) ??
    revisarRutas(values, root) ??
    revisarJaula(values, toolName, toolInput) ??
    revisarContenido(toolInput);
  if (denegado) return denegado;
  if (values.some((v) => PEDIR_PERMISO.some((re) => re.test(v)))) {
    return { decision: "ask", reason: "Acción con efecto fuera de su máquina o dependencia nueva: requiere permiso." };
  }
  return { decision: "allow" };
}

/** Lee el evento del hook desde stdin; tolera JSON vacío o inválido. */
async function leerEvento() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  try {
    const event = JSON.parse(raw || "{}");
    return {
      input: event.tool_input ?? event.toolInput ?? event.input ?? event,
      toolName: String(event.tool_name ?? event.toolName ?? ""),
    };
  } catch {
    return { input: {}, toolName: "" };
  }
}

async function main() {
  const { input, toolName } = await leerEvento();
  const { decision, reason } = evaluate(input, process.cwd(), toolName);
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
