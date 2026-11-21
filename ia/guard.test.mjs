// Evidencia: las restricciones de seguridad de la IA funcionan. Ejecutar: npm run test:ia
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { evaluate } from "./guard.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const decide = (input) => evaluate(input, root).decision;

test("bloquea leer .env y variantes", () => {
  for (const p of [".env", ".env.local", ".env.production", "src/../.env", "type .env"]) {
    assert.equal(decide({ path: p, command: p }), "deny", p);
  }
});

// Antes se permitía .env.example. La hoja 2 pide que la regla también bloquee la plantilla,
// así que ahora se usa env.example (sin punto) y .env.example se deniega (más estricto).
test("permite env.example y bloquea .env.example", () => {
  assert.equal(decide({ path: "env.example" }), "allow");
  assert.equal(decide({ path: ".env.example" }), "deny");
});

test("bloquea claves, keystores y credenciales", () => {
  for (const p of [
    "clave.pem",
    "release.keystore",
    "upload.jks",
    "serviceAccount.json",
    "my-firebase-adminsdk-x.json",
    "id_rsa",
    "google-services.json",
  ]) {
    assert.equal(decide({ path: p }), "deny", p);
  }
});

test("bloquea salir de la carpeta del proyecto", () => {
  assert.equal(decide({ path: "../otro-proyecto/archivo.ts" }), "deny");
  assert.equal(decide({ path: "C:\\Windows\\System32\\drivers\\etc\\hosts" }), "deny");
  assert.equal(decide({ path: "/etc/passwd" }), "deny");
  assert.equal(decide({ command: "Get-Content ~/.ssh/config" }), "deny");
  assert.equal(decide({ command: "cat ..\\..\\secreto.txt" }), "deny");
});

test("permite trabajo normal dentro del proyecto", () => {
  assert.equal(decide({ path: "src/lib/auth.ts" }), "allow");
  assert.equal(decide({ path: path.join(root, "src", "lib", "auth.ts") }), "allow");
  assert.equal(decide({ command: "npm test" }), "allow");
});

test("el contenido de un archivo no se interpreta como ruta", () => {
  assert.equal(decide({ path: "README.md", text: "ver /api/health y ../docs" }), "allow");
});

// Antes curl pedía permiso. La hoja 4 lo pone en «Denegar»: ahora se deniega (más estricto).
test("pide permiso para acciones con efecto externo; curl se deniega", () => {
  for (const command of ["git push origin main", "vercel deploy --prod", "npm publish"]) {
    assert.equal(decide({ command }), "ask", command);
  }
  assert.equal(decide({ command: "curl https://example.com" }), "deny");
});

test("el hook por línea de comandos bloquea con código 2", () => {
  const run = (event) =>
    spawnSync(process.execPath, [path.join(root, "ia", "guard.mjs")], {
      input: JSON.stringify(event),
      cwd: root,
      encoding: "utf8",
    });
  const denied = run({ tool_name: "read_file", tool_input: { path: ".env" } });
  assert.equal(denied.status, 2);
  assert.match(denied.stderr, /BLOQUEADO/);
  assert.equal(run({ tool_name: "read_file", tool_input: { path: "package.json" } }).status, 0);
  const ask = run({ tool_name: "execute_pwsh", tool_input: { command: "git push" } });
  assert.equal(ask.status, 0);
  assert.match(ask.stdout, /"permissionDecision":"ask"/);
});

test("bloquea salir de la carpeta también con reglas de Linux (CI)", async () => {
  const { fueraDelProyecto } = await import("./guard.mjs");
  const raiz = "/home/runner/work/repo";
  for (const t of ["C:\\Windows\\System32\\hosts", "..\\..\\secreto.txt", "../otro", "/etc/passwd", "~/.ssh/config"]) {
    assert.equal(fueraDelProyecto(t, raiz, "posix"), true, t);
  }
  for (const t of ["src/lib/auth.ts", "./src\\lib\\x.ts"]) assert.equal(fueraDelProyecto(t, raiz, "posix"), false, t);
});
