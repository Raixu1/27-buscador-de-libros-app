import { ApiError } from "@/api/client";
import type { CuerpoLectura } from "@/api/endpoints";
import type { LecturaRepository } from "@/repositories/lecturaRepository";
import type { Lectura, LecturaRemota } from "@/types";

const PAGINA = 500;
const META_SINCE = "since";

export type RemotoApi = {
  listar(since: string | null): Promise<{ items: LecturaRemota[]; servidor_ahora: string }>;
  guardar(id: string, cuerpo: CuerpoLectura): Promise<LecturaRemota>;
  borrar(id: string): Promise<unknown>;
};

export type ResultadoSync = { enviados: number; recibidos: number };

function aCuerpo(l: Lectura): CuerpoLectura {
  return {
    titulo: l.titulo,
    autores: l.autores,
    portada_url: l.portada_url,
    anio: l.anio,
    estado: l.estado,
    calificacion: l.estado === "leido" ? l.calificacion : null,
    nota: l.nota,
  };
}

function desdeRemoto(r: LecturaRemota): Lectura {
  return {
    id: r.id,
    titulo: r.titulo,
    autores: r.autores,
    portada_url: r.portada_url,
    anio: r.anio,
    estado: r.estado,
    calificacion: r.calificacion,
    nota: r.nota,
    remote_id: r.id,
    updated_at: r.updated_at,
    deleted: r.deleted_at !== null,
    pending: false,
  };
}

/** Envía los cambios pendientes (SQLite → API). */
export async function enviarPendientes(repo: LecturaRepository, api: RemotoApi): Promise<number> {
  const pendientes = await repo.pendientes();
  for (const item of pendientes) {
    if (item.deleted) {
      try {
        await api.borrar(item.id);
      } catch (e) {
        if (!(e instanceof ApiError && e.status === 404)) throw e;
      }
      await repo.marcarSincronizado(item.id, item.updated_at);
    } else {
      const remoto = await api.guardar(item.id, aCuerpo(item));
      await repo.marcarSincronizado(item.id, remoto.updated_at);
    }
  }
  return pendientes.length;
}

/** Trae los cambios del servidor (API → SQLite). Gana la última escritura (updated_at del servidor). */
export async function traerCambios(repo: LecturaRepository, api: RemotoApi): Promise<number> {
  let since = await repo.getMeta(META_SINCE);
  let recibidos = 0;
  for (;;) {
    const { items } = await api.listar(since);
    for (const remoto of items) {
      const local = await repo.obtener(remoto.id);
      if (local?.pending) continue; // el cambio local pendiente se envía en la próxima sincronización
      await repo.guardar(desdeRemoto(remoto));
      recibidos++;
    }
    if (items.length > 0) since = items[items.length - 1].updated_at;
    if (items.length < PAGINA) break;
  }
  if (since) await repo.setMeta(META_SINCE, since);
  return recibidos;
}

let enCurso: Promise<ResultadoSync> | null = null;

/** Primero envía lo pendiente y luego trae cambios. Evita ejecuciones simultáneas. */
export function sincronizar(repo: LecturaRepository, api: RemotoApi): Promise<ResultadoSync> {
  enCurso ??= (async () => {
    try {
      const enviados = await enviarPendientes(repo, api);
      const recibidos = await traerCambios(repo, api);
      return { enviados, recibidos };
    } finally {
      enCurso = null;
    }
  })();
  return enCurso;
}
