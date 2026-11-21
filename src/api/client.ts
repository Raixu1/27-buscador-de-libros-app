import type { z } from "zod";
import { tokensSchema } from "@/api/schemas";
import { borrarSesion, guardarTokens, leerTokens } from "@/api/tokens";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
  /** Sin conexión o tiempo agotado. */
  get esRed() {
    return this.status === 0;
  }
}

const TIMEOUT_MS = 15_000;

export function apiBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, "");
  if (!url) throw new ApiError(0, "Falta configurar EXPO_PUBLIC_API_URL.");
  if (!url.startsWith("https://") && !__DEV__) throw new ApiError(0, "La API debe usar HTTPS.");
  return url;
}

let onSesionExpirada: (() => void) | null = null;
export function alExpirarSesion(handler: (() => void) | null) {
  onSesionExpirada = handler;
}

async function enviar(path: string, method: string, body: unknown, token: string | null): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(`${apiBaseUrl()}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(0, "No hay conexión con el servidor.");
  } finally {
    clearTimeout(timer);
  }
}

/** Extrae `error` del cuerpo { error: string } que define la API, si existe. */
function mensajeDeError(data: unknown): string | null {
  if (typeof data !== "object" || data === null || !("error" in data)) return null;
  return typeof data.error === "string" ? data.error : null;
}

/** Lee el JSON y lo valida contra el contrato esperado (Zod). */
async function leerRespuesta<T>(res: Response, schema: z.ZodType<T>): Promise<T> {
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const mensaje = mensajeDeError(data) ?? "Error inesperado del servidor.";
    throw new ApiError(res.status, mensaje);
  }
  const r = schema.safeParse(data);
  if (!r.success) throw new ApiError(502, "Respuesta inválida del servidor.");
  return r.data;
}

let renovando: Promise<string | null> | null = null;

/** Renueva el token una sola vez (las peticiones concurrentes comparten la misma renovación). */
async function renovarToken(): Promise<string | null> {
  renovando ??= (async () => {
    try {
      const actual = await leerTokens();
      if (!actual) return null;
      const res = await enviar("/api/auth/refresh", "POST", { refreshToken: actual.refreshToken }, null);
      if (!res.ok) return null;
      const nuevo = await leerRespuesta(res, tokensSchema);
      await guardarTokens({ token: nuevo.token, refreshToken: nuevo.refreshToken });
      return nuevo.token;
    } catch {
      return null;
    } finally {
      renovando = null;
    }
  })();
  return renovando;
}

/** Petición a la API: token Bearer, un único refresh ante 401 y validación de la respuesta con `schema`. */
export async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  opts: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = "GET", body, auth = true } = opts;
  if (!auth) return leerRespuesta(await enviar(path, method, body, null), schema);

  const tokens = await leerTokens();
  if (!tokens) throw new ApiError(401, "No has iniciado sesión.");
  let res = await enviar(path, method, body, tokens.token);
  if (res.status === 401) {
    // Un solo intento de renovación; si falla, se vuelve al login.
    const nuevo = await renovarToken();
    if (!nuevo) {
      await borrarSesion();
      onSesionExpirada?.();
      throw new ApiError(401, "Tu sesión expiró. Inicia sesión de nuevo.");
    }
    res = await enviar(path, method, body, nuevo);
  }
  return leerRespuesta(res, schema);
}
