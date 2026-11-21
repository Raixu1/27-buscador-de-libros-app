import type { Db } from "@/db";
import type { Estado, Lectura } from "@/types";

type Fila = {
  id: string;
  titulo: string;
  autores: string;
  portada_url: string | null;
  anio: number | null;
  estado: Estado;
  calificacion: number | null;
  nota: string | null;
  remote_id: string | null;
  updated_at: string | null;
  deleted: number | null;
  pending: number | null;
};

function parseAutores(json: string): string[] {
  try {
    const v: unknown = JSON.parse(json);
    return Array.isArray(v) ? v.filter((a): a is string => typeof a === "string") : [];
  } catch {
    return [];
  }
}

export function aLectura(f: Fila): Lectura {
  return {
    id: f.id,
    titulo: f.titulo,
    autores: parseAutores(f.autores),
    portada_url: f.portada_url,
    anio: f.anio,
    estado: f.estado,
    calificacion: f.calificacion,
    nota: f.nota,
    remote_id: f.remote_id,
    updated_at: f.updated_at ?? "",
    deleted: f.deleted === 1,
    pending: f.pending === 1,
  };
}

export function crearLecturaRepository(db: Db) {
  return {
    /** Lista no borrada. Filtra por estado y por texto (título o autores). */
    async listar(opts: { estado?: Estado | null; texto?: string } = {}): Promise<Lectura[]> {
      const where = ["deleted = 0"];
      const params: (string | number)[] = [];
      if (opts.estado) {
        where.push("estado = ?");
        params.push(opts.estado);
      }
      const texto = opts.texto?.trim();
      if (texto) {
        where.push("(titulo LIKE ? OR autores LIKE ?)");
        params.push(`%${texto}%`, `%${texto}%`);
      }
      const filas = await db.getAllAsync<Fila>(
        `SELECT * FROM lectura WHERE ${where.join(" AND ")} ORDER BY updated_at DESC, titulo ASC`,
        params,
      );
      return filas.map(aLectura);
    },

    /** Incluye borrados lógicos (necesario para detectar duplicados y revivir). */
    async obtener(id: string): Promise<Lectura | null> {
      const f = await db.getFirstAsync<Fila>("SELECT * FROM lectura WHERE id = ?", [id]);
      return f ? aLectura(f) : null;
    },

    /** Inserta o reemplaza una fila local, dejando constancia de si está pendiente de enviar. */
    async guardar(item: Lectura): Promise<void> {
      await db.runAsync(
        `INSERT OR REPLACE INTO lectura
         (id, titulo, autores, portada_url, anio, estado, calificacion, nota, remote_id, updated_at, deleted, pending)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.titulo,
          JSON.stringify(item.autores),
          item.portada_url,
          item.anio,
          item.estado,
          item.calificacion,
          item.nota,
          item.remote_id ?? item.id,
          item.updated_at,
          item.deleted ? 1 : 0,
          item.pending ? 1 : 0,
        ],
      );
    },

    async pendientes(): Promise<Lectura[]> {
      const filas = await db.getAllAsync<Fila>("SELECT * FROM lectura WHERE pending = 1");
      return filas.map(aLectura);
    },

    async marcarSincronizado(id: string, updatedAt: string): Promise<void> {
      await db.runAsync("UPDATE lectura SET pending = 0, updated_at = ? WHERE id = ?", [updatedAt, id]);
    },

    /** RF-06: libros leídos este año (según la fecha de la última modificación). */
    async contarLeidosDelAnio(anio: number): Promise<number> {
      const r = await db.getFirstAsync<{ n: number }>(
        "SELECT COUNT(*) AS n FROM lectura WHERE deleted = 0 AND estado = 'leido' AND substr(updated_at, 1, 4) = ?",
        [String(anio)],
      );
      return r?.n ?? 0;
    },

    async getMeta(clave: string): Promise<string | null> {
      const r = await db.getFirstAsync<{ valor: string }>("SELECT valor FROM meta WHERE clave = ?", [clave]);
      return r?.valor ?? null;
    },

    async setMeta(clave: string, valor: string): Promise<void> {
      await db.runAsync("INSERT OR REPLACE INTO meta (clave, valor) VALUES (?, ?)", [clave, valor]);
    },

    async vaciar(): Promise<void> {
      await db.execAsync("DELETE FROM lectura; DELETE FROM meta;");
    },
  };
}

export type LecturaRepository = ReturnType<typeof crearLecturaRepository>;
