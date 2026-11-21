export type Estado = "quiero" | "leyendo" | "leido";

export const ESTADOS: { valor: Estado; etiqueta: string }[] = [
  { valor: "quiero", etiqueta: "Quiero leer" },
  { valor: "leyendo", etiqueta: "Leyendo" },
  { valor: "leido", etiqueta: "Leído" },
];

export const etiquetaEstado = (e: Estado) => ESTADOS.find((x) => x.valor === e)?.etiqueta ?? e;

/** Libro tal como lo entrega la API (solo campos usados). */
export type LibroResumen = {
  id: string;
  titulo: string;
  autores: string[];
  portada_url: string | null;
  anio: number | null;
};

/** Fila de la tabla `lectura` ya convertida a tipos de la app. */
export type Lectura = LibroResumen & {
  estado: Estado;
  calificacion: number | null;
  nota: string | null;
  remote_id: string | null;
  updated_at: string;
  deleted: boolean;
  pending: boolean;
};

/** Documento de Firestore devuelto por la API de sincronización. */
export type LecturaRemota = LibroResumen & {
  estado: Estado;
  calificacion: number | null;
  nota: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};
