import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import type { EstadoLista } from "@/components/ListaEstados";
import { repositorio, sincronizarAhora } from "@/services/listaService";
import type { Estado, Lectura } from "@/types";

type Filtros = { filtro: Estado | null; consulta: string };

/** RF-04/RF-05/RF-06: lista local (SQLite) filtrada, estadística del año y sincronización. */
export function useMiLista(filtros: Filtros) {
  const [items, setItems] = useState<Lectura[]>([]);
  const [estado, setEstado] = useState<EstadoLista>("cargando");
  const [leidos, setLeidos] = useState(0);
  const [refrescando, setRefrescando] = useState(false);
  const [enfocado, setEnfocado] = useState(false);
  const [sinConexion, setSinConexion] = useState(false);
  const filtrosRef = useRef<Filtros>(filtros);

  const cargar = useCallback(async () => {
    try {
      const repo = await repositorio();
      const lista = await repo.listar({ estado: filtrosRef.current.filtro, texto: filtrosRef.current.consulta });
      setItems(lista);
      setLeidos(await repo.contarLeidosDelAnio(new Date().getFullYear()));
      setEstado(lista.length === 0 ? "vacio" : "ok");
    } catch {
      setEstado("error");
    }
  }, []);

  const sincronizar = useCallback(async () => {
    setSinConexion((await sincronizarAhora()) === null);
    await cargar();
  }, [cargar]);

  useFocusEffect(
    useCallback(() => {
      setEnfocado(true);
      cargar().then(sincronizar);
      return () => setEnfocado(false);
    }, [cargar, sincronizar]),
  );

  useEffect(() => {
    filtrosRef.current = filtros;
    cargar();
  }, [filtros, cargar]);

  const refrescar = useCallback(async () => {
    setRefrescando(true);
    await sincronizar();
    setRefrescando(false);
  }, [sincronizar]);

  return { items, estado, leidos, refrescando, enfocado, sinConexion, cargar, refrescar };
}
