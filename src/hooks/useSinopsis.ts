import { useCallback, useEffect, useState } from "react";
import { sinopsis } from "@/api/endpoints";

type Resultado = { id: string; texto: string | null; error: boolean };

/** Sinopsis de un libro. El estado se deriva del id pedido (sin setState síncrono en el efecto). */
export function useSinopsis(id: string | null) {
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!id) return;
    let vigente = true;
    sinopsis(id)
      .then((r) => vigente && setResultado({ id, texto: r.descripcion, error: false }))
      .catch(() => vigente && setResultado({ id, texto: null, error: true }));
    return () => {
      vigente = false;
    };
  }, [id, intento]);

  const reintentar = useCallback(() => {
    setResultado(null);
    setIntento((i) => i + 1);
  }, []);

  const actual = resultado && resultado.id === id ? resultado : null;
  const estado: "cargando" | "ok" | "error" = !actual ? "cargando" : actual.error ? "error" : "ok";
  return { estado, texto: actual?.texto ?? null, reintentar };
}
