import { useCallback, useEffect, useState } from "react";
import { useQuitarLibro } from "@/hooks/useQuitarLibro";
import { vibrarExito } from "@/services/haptics";
import { actualizarLibro, agregarLibro, repositorio, sincronizarAhora } from "@/services/listaService";
import type { Estado, Lectura, LibroResumen } from "@/types";

type Avisar = (texto: string, error?: boolean) => void;

/** RF-03: estado, calificación y nota de un libro en mi lista (crear, editar y quitar). */
export function useLecturaLibro(libro: LibroResumen, avisar: Avisar) {
  const [guardado, setGuardado] = useState<Lectura | null>(null);
  const [estado, setEstado] = useState<Estado>("quiero");
  const [calificacion, setCalificacion] = useState<number | null>(null);
  const [nota, setNota] = useState("");
  const quitar = useQuitarLibro(libro);

  useEffect(() => {
    let vigente = true;
    repositorio()
      .then((repo) => repo.obtener(libro.id))
      .then((fila) => {
        if (!vigente || !fila || fila.deleted) return;
        setGuardado(fila);
        setEstado(fila.estado);
        setCalificacion(fila.calificacion);
        setNota(fila.nota ?? "");
      })
      .catch(() => undefined);
    return () => {
      vigente = false;
    };
  }, [libro.id]);

  const cambiarEstado = useCallback((e: Estado | null) => {
    if (!e) return;
    setEstado(e);
    if (e !== "leido") setCalificacion(null);
  }, []);

  const guardar = useCallback(async () => {
    try {
      const repo = await repositorio();
      const datos = { estado, calificacion, nota };
      const fila = guardado ? await actualizarLibro(repo, libro.id, datos) : await agregarLibro(repo, libro, datos);
      setGuardado(fila);
      vibrarExito();
      avisar(guardado ? "Cambios guardados" : "Agregado a tu lista");
      sincronizarAhora().catch(() => undefined);
    } catch (e) {
      avisar(e instanceof Error ? e.message : "No se pudo guardar.", true);
    }
  }, [estado, calificacion, nota, guardado, libro, avisar]);

  return { guardado, estado, calificacion, nota, setCalificacion, setNota, cambiarEstado, guardar, quitar };
}
