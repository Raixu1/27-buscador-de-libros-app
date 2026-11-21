/** Normaliza (quita guiones y espacios) y valida ISBN-10 o ISBN-13. Devuelve el ISBN limpio o null. */
export function normalizarIsbn(entrada: string): string | null {
  const limpio = entrada.replace(/[\s-]/g, "").toUpperCase();
  if (/^\d{9}[\dX]$/.test(limpio)) return esIsbn10Valido(limpio) ? limpio : null;
  if (/^\d{13}$/.test(limpio)) return esIsbn13Valido(limpio) ? limpio : null;
  return null;
}

export function esIsbn10Valido(isbn: string): boolean {
  if (!/^\d{9}[\dX]$/.test(isbn)) return false;
  const suma = [...isbn].reduce((acc, ch, i) => acc + (ch === "X" ? 10 : Number(ch)) * (10 - i), 0);
  return suma % 11 === 0;
}

export function esIsbn13Valido(isbn: string): boolean {
  if (!/^\d{13}$/.test(isbn)) return false;
  const suma = [...isbn].reduce((acc, ch, i) => acc + Number(ch) * (i % 2 === 0 ? 1 : 3), 0);
  return suma % 10 === 0;
}
