import type { LecturaRepository } from "@/repositories/lecturaRepository";
import type { Lectura } from "@/types";

/** Repositorio en memoria con la misma interfaz que el de SQLite. */
export function crearRepoEnMemoria(): LecturaRepository & { filas: Map<string, Lectura> } {
  const filas = new Map<string, Lectura>();
  const meta = new Map<string, string>();
  return {
    filas,
    async listar(opts = {}) {
      return [...filas.values()].filter(
        (f) =>
          !f.deleted && (!opts.estado || f.estado === opts.estado) && (!opts.texto || f.titulo.includes(opts.texto)),
      );
    },
    async obtener(id) {
      return filas.get(id) ?? null;
    },
    async guardar(item) {
      filas.set(item.id, { ...item });
    },
    async pendientes() {
      return [...filas.values()].filter((f) => f.pending);
    },
    async marcarSincronizado(id, updatedAt) {
      const f = filas.get(id);
      if (f) filas.set(id, { ...f, pending: false, updated_at: updatedAt });
    },
    async contarLeidosDelAnio(anio) {
      return [...filas.values()].filter(
        (f) => !f.deleted && f.estado === "leido" && f.updated_at.startsWith(String(anio)),
      ).length;
    },
    async getMeta(k) {
      return meta.get(k) ?? null;
    },
    async setMeta(k, v) {
      meta.set(k, v);
    },
    async vaciar() {
      filas.clear();
      meta.clear();
    },
  };
}
