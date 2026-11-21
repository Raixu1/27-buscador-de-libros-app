import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { vibrarExito } from "@/services/haptics";
import { agregarLibro, repositorio, sincronizarAhora } from "@/services/listaService";
import type { Estado, LibroResumen } from "@/types";

/** Qué libros de los resultados ya están en mi lista, y agregar rápido a «Quiero leer». */
export function useMapaLista(avisar: (texto: string, error?: boolean) => void) {
  const [enLista, setEnLista] = useState<Record<string, Estado>>({});

  const recargar = useCallback(async () => {
    const items = await (await repositorio()).listar();
    setEnLista(Object.fromEntries(items.map((i) => [i.id, i.estado])));
  }, []);

  useFocusEffect(
    useCallback(() => {
      recargar().catch(() => undefined);
    }, [recargar]),
  );

  const agregarQuiero = useCallback(
    async (libro: LibroResumen) => {
      try {
        await agregarLibro(await repositorio(), libro, { estado: "quiero", calificacion: null, nota: null });
        vibrarExito();
        avisar(`«${libro.titulo}» agregado a Quiero leer`);
        await recargar();
        sincronizarAhora().catch(() => undefined);
      } catch (e) {
        avisar(e instanceof Error ? e.message : "No se pudo agregar.", true);
      }
    },
    [avisar, recargar],
  );

  return { enLista, agregarQuiero };
}
