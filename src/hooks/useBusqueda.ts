import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/api/client";
import { buscarLibros } from "@/api/endpoints";
import type { EstadoLista } from "@/components/ListaEstados";
import { validarBusqueda } from "@/services/validacion";
import type { LibroResumen } from "@/types";

type Pagina = { q: string; resultados: LibroResumen[]; pagina: number; hayMas: boolean; error: string | null };

/** Pide una página; nunca lanza: el error queda en el resultado. */
async function cargarPagina(q: string, pagina: number): Promise<Pagina> {
  try {
    const r = await buscarLibros(q, pagina);
    return { q, resultados: r.resultados, pagina, hayMas: r.hay_mas, error: null };
  } catch (e) {
    return {
      q,
      resultados: [],
      pagina,
      hayMas: false,
      error: e instanceof ApiError ? e.message : "No se pudo buscar.",
    };
  }
}

function anexar(prev: Pagina | null, nueva: Pagina): Pagina | null {
  if (!prev || prev.q !== nueva.q) return prev;
  if (nueva.error) return { ...prev, hayMas: false };
  return { ...nueva, resultados: [...prev.resultados, ...nueva.resultados] };
}

function estadoDe(valida: boolean, consulta: string, datos: Pagina | null): EstadoLista | "inicial" {
  if (!valida) return "inicial";
  if (!datos || datos.q !== consulta) return "cargando";
  if (datos.error) return "error";
  return datos.resultados.length === 0 ? "vacio" : "ok";
}

/** RF-01: búsqueda paginada. El estado se deriva de la consulta (sin setState dentro del efecto). */
export function useBusqueda(consulta: string) {
  const [datos, setDatos] = useState<Pagina | null>(null);
  const [intento, setIntento] = useState(0);
  const [refrescando, setRefrescando] = useState(false);
  const [cargandoMas, setCargandoMas] = useState(false);
  const valida = validarBusqueda(consulta) === null;

  useEffect(() => {
    if (!valida) return;
    let vigente = true;
    cargarPagina(consulta, 1).then((p) => vigente && setDatos(p));
    return () => {
      vigente = false;
    };
  }, [consulta, valida, intento]);

  const reintentar = useCallback(() => {
    setDatos(null);
    setIntento((i) => i + 1);
  }, []);

  const refrescar = useCallback(async () => {
    setRefrescando(true);
    const p = await cargarPagina(consulta, 1);
    setDatos((prev) => (prev?.q === p.q || !prev ? p : prev));
    setRefrescando(false);
  }, [consulta]);

  const cargarMas = useCallback(async () => {
    if (!datos?.hayMas || cargandoMas || datos.q !== consulta) return;
    setCargandoMas(true);
    const p = await cargarPagina(consulta, datos.pagina + 1);
    setDatos((prev) => anexar(prev, p));
    setCargandoMas(false);
  }, [datos, cargandoMas, consulta]);

  const estado = estadoDe(valida, consulta, datos);
  const resultados = estado === "ok" && datos ? datos.resultados : [];
  return {
    estado,
    resultados,
    error: datos?.error ?? undefined,
    refrescando,
    cargandoMas,
    reintentar,
    refrescar,
    cargarMas,
  };
}
