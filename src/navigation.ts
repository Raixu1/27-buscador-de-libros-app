import type { useRouter } from "expo-router";
import type { LibroResumen } from "@/types";

type Router = ReturnType<typeof useRouter>;

type ParamsLibro = { id: string; titulo?: string; autores?: string; portada?: string; anio?: string };

export function paramsDeLibro(libro: LibroResumen): ParamsLibro {
  return {
    id: libro.id,
    titulo: libro.titulo,
    autores: JSON.stringify(libro.autores),
    portada: libro.portada_url ?? "",
    anio: libro.anio === null ? "" : String(libro.anio),
  };
}

export function abrirLibro(router: Router, libro: LibroResumen, reemplazar = false): void {
  const destino = { pathname: "/libro/[id]", params: paramsDeLibro(libro) } as const;
  if (reemplazar) router.replace(destino);
  else router.push(destino);
}

const valor = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);

export function libroDeParams(p: Record<string, string | string[] | undefined>): LibroResumen {
  let autores: string[] = [];
  try {
    const parsed: unknown = JSON.parse(valor(p.autores) ?? "[]");
    if (Array.isArray(parsed)) autores = parsed.filter((a): a is string => typeof a === "string");
  } catch {
    autores = [];
  }
  const anio = Number(valor(p.anio));
  return {
    id: String(valor(p.id) ?? ""),
    titulo: valor(p.titulo) ?? "Libro",
    autores,
    portada_url: valor(p.portada) || null,
    anio: Number.isFinite(anio) && valor(p.anio) ? anio : null,
  };
}
