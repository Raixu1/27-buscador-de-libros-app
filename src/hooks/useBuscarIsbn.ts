import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ApiError } from "@/api/client";
import { libroPorIsbn } from "@/api/endpoints";
import { abrirLibro } from "@/navigation";
import { vibrarExito } from "@/services/haptics";
import { normalizarIsbn } from "@/services/isbn";

/** RF-02: valida el ISBN, lo busca y abre el libro. Ignora lecturas repetidas de la cámara. */
export function useBuscarIsbn() {
  const router = useRouter();
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultimoIsbn, setUltimoIsbn] = useState<string | null>(null);
  const ocupado = useRef(false);

  const buscar = useCallback(
    async (entrada: string) => {
      if (ocupado.current) return;
      const isbn = normalizarIsbn(entrada);
      if (!isbn) return setError("Ese ISBN no es válido. Revisa los dígitos.");
      ocupado.current = true;
      setUltimoIsbn(isbn);
      setError(null);
      setBuscando(true);
      try {
        const libro = await libroPorIsbn(isbn);
        vibrarExito();
        abrirLibro(router, libro, true);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "No se pudo buscar el libro.");
      } finally {
        setBuscando(false);
        ocupado.current = false;
      }
    },
    [router],
  );

  return { buscar, buscando, error, setError, ultimoIsbn };
}
