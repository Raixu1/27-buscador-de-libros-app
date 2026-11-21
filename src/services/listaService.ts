import * as api from "@/api/endpoints";
import { getDb } from "@/db";
import { crearLecturaRepository, type LecturaRepository } from "@/repositories/lecturaRepository";
import { sincronizar, type ResultadoSync } from "@/services/syncService";
import { ValidationError, validarCalificacion } from "@/services/validacion";
import type { Estado, Lectura, LibroResumen } from "@/types";

let repoPromise: Promise<LecturaRepository> | null = null;
export function repositorio(): Promise<LecturaRepository> {
  repoPromise ??= getDb().then(crearLecturaRepository);
  return repoPromise;
}

export type DatosLectura = { estado: Estado; calificacion: number | null; nota: string | null };

function normalizar(d: DatosLectura): DatosLectura {
  const error = validarCalificacion(d.estado, d.calificacion);
  if (error) throw new ValidationError(error);
  const nota = d.nota?.trim() ? d.nota.trim().slice(0, 2000) : null;
  return { estado: d.estado, calificacion: d.calificacion, nota };
}

/** Agrega un libro a la lista. Rechaza duplicados. Escribe primero en SQLite (pending = 1). */
export async function agregarLibro(repo: LecturaRepository, libro: LibroResumen, datos: DatosLectura): Promise<Lectura> {
  const limpio = normalizar(datos);
  const existente = await repo.obtener(libro.id);
  if (existente && !existente.deleted) throw new ValidationError("Este libro ya está en tu lista.");
  const item: Lectura = {
    ...libro,
    ...limpio,
    remote_id: libro.id,
    updated_at: new Date().toISOString(),
    deleted: false,
    pending: true,
  };
  await repo.guardar(item);
  return item;
}

export async function actualizarLibro(repo: LecturaRepository, id: string, datos: DatosLectura): Promise<Lectura> {
  const limpio = normalizar(datos);
  const actual = await repo.obtener(id);
  if (!actual || actual.deleted) throw new ValidationError("El libro no está en tu lista.");
  const item: Lectura = { ...actual, ...limpio, updated_at: new Date().toISOString(), pending: true };
  await repo.guardar(item);
  return item;
}

export async function quitarLibro(repo: LecturaRepository, id: string): Promise<void> {
  const actual = await repo.obtener(id);
  if (!actual) return;
  await repo.guardar({ ...actual, deleted: true, updated_at: new Date().toISOString(), pending: true });
}

export const libroAleatorio = <T>(items: T[], azar: () => number = Math.random): T | null =>
  items.length === 0 ? null : items[Math.min(items.length - 1, Math.floor(azar() * items.length))];

/** Sincroniza con la API. Si no hay conexión devuelve null (la lista local sigue disponible). */
export async function sincronizarAhora(): Promise<ResultadoSync | null> {
  const repo = await repositorio();
  try {
    return await sincronizar(repo, {
      listar: api.listarLecturaRemota,
      guardar: api.guardarLecturaRemota,
      borrar: api.borrarLecturaRemota,
    });
  } catch {
    return null;
  }
}

export async function limpiarDatosLocales(): Promise<void> {
  await (await repositorio()).vaciar();
}
