import type { z } from "zod";
import { request } from "@/api/client";
import {
  cambiosSchema,
  lecturaRemotaSchema,
  libroSchema,
  okSchema,
  paginaLibrosSchema,
  sesionSchema,
  sinopsisSchema,
} from "@/api/schemas";
import type { LecturaRemota } from "@/types";

export type SesionApi = z.infer<typeof sesionSchema>;
export type PaginaLibros = z.infer<typeof paginaLibrosSchema>;

const e = encodeURIComponent;

export const login = (email: string, password: string) =>
  request("/api/auth/login", sesionSchema, { method: "POST", body: { email, password }, auth: false });

export const registro = (email: string, password: string) =>
  request("/api/auth/registro", sesionSchema, { method: "POST", body: { email, password }, auth: false });

export const buscarLibros = (q: string, pagina: number) =>
  request(`/api/libros/buscar?q=${e(q)}&pagina=${pagina}`, paginaLibrosSchema);

export const libroPorIsbn = (isbn: string) => request(`/api/libros/isbn/${e(isbn)}`, libroSchema);

export const sinopsis = (id: string) => request(`/api/libros/detalle/${e(id)}`, sinopsisSchema);

export const listarLecturaRemota = (since: string | null) =>
  request(`/api/lectura${since ? `?since=${e(since)}` : ""}`, cambiosSchema);

export type CuerpoLectura = Pick<
  LecturaRemota,
  "titulo" | "autores" | "portada_url" | "anio" | "estado" | "calificacion" | "nota"
>;

export const guardarLecturaRemota = (id: string, cuerpo: CuerpoLectura) =>
  request(`/api/lectura/${e(id)}`, lecturaRemotaSchema, { method: "PUT", body: cuerpo });

export const borrarLecturaRemota = (id: string) => request(`/api/lectura/${e(id)}`, okSchema, { method: "DELETE" });
