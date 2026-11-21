import { request } from "@/api/client";
import type { LecturaRemota, LibroResumen } from "@/types";

export type SesionApi = {
  token: string;
  refreshToken: string;
  expiraEnSeg: number;
  usuario: { id: string; email: string };
};

export const login = (email: string, password: string) =>
  request<SesionApi>("/api/auth/login", { method: "POST", body: { email, password }, auth: false });

export const registro = (email: string, password: string) =>
  request<SesionApi>("/api/auth/registro", { method: "POST", body: { email, password }, auth: false });

export type PaginaLibros = { resultados: LibroResumen[]; total: number; pagina: number; hay_mas: boolean };

export const buscarLibros = (q: string, pagina: number) =>
  request<PaginaLibros>(`/api/libros/buscar?q=${encodeURIComponent(q)}&pagina=${pagina}`);

export const libroPorIsbn = (isbn: string) =>
  request<LibroResumen>(`/api/libros/isbn/${encodeURIComponent(isbn)}`);

export const sinopsis = (id: string) =>
  request<{ id: string; descripcion: string | null }>(`/api/libros/detalle/${encodeURIComponent(id)}`);

export const listarLecturaRemota = (since: string | null) =>
  request<{ items: LecturaRemota[]; servidor_ahora: string }>(
    `/api/lectura${since ? `?since=${encodeURIComponent(since)}` : ""}`,
  );

export type CuerpoLectura = Pick<
  LecturaRemota,
  "titulo" | "autores" | "portada_url" | "anio" | "estado" | "calificacion" | "nota"
>;

export const guardarLecturaRemota = (id: string, cuerpo: CuerpoLectura) =>
  request<LecturaRemota>(`/api/lectura/${encodeURIComponent(id)}`, { method: "PUT", body: cuerpo });

export const borrarLecturaRemota = (id: string) =>
  request<{ ok: true }>(`/api/lectura/${encodeURIComponent(id)}`, { method: "DELETE" });
