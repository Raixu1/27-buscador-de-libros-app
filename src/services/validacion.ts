import type { Estado } from "@/types";

export class ValidationError extends Error {}

export const MIN_BUSQUEDA = 3;

/** Devuelve un mensaje de error o null si la búsqueda es válida. */
export function validarBusqueda(texto: string): string | null {
  return texto.trim().length >= MIN_BUSQUEDA ? null : `Escribe al menos ${MIN_BUSQUEDA} caracteres.`;
}

/** La calificación (1–5) solo aplica si el estado es «leido». */
export function validarCalificacion(estado: Estado, calificacion: number | null): string | null {
  if (calificacion === null) return null;
  if (estado !== "leido") return "Solo puedes calificar un libro que ya leíste.";
  if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5) {
    return "La calificación debe estar entre 1 y 5.";
  }
  return null;
}

export function validarEmail(email: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? null : "Correo inválido.";
}

export function validarPassword(password: string): string | null {
  return password.length >= 8 ? null : "La contraseña debe tener al menos 8 caracteres.";
}
