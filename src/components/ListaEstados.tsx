import type { ReactElement } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, type ListRenderItem } from "react-native";
import { EstadoCargando, EstadoError, EstadoVacio } from "@/components/EstadosLista";
import type { NombreIcono } from "@/components/Icono";
import { ANCHO_MAX, colores, espacio } from "@/theme";

export type EstadoLista = "cargando" | "error" | "vacio" | "ok";

type Props<T> = {
  estado: EstadoLista;
  datos: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T) => string;
  mensajeError?: string;
  onReintentar?: () => void;
  tituloVacio: string;
  iconoVacio?: NombreIcono;
  sugerencias?: string[];
  onRefrescar?: () => void;
  refrescando?: boolean;
  onFinal?: () => void;
  cargandoMas?: boolean;
  encabezado?: ReactElement | null;
};

/**
 * Devuelve el elemento RefreshControl tal cual (no un componente propio): en Android la lista
 * lo clona y le mete su contenido como hijos; un envoltorio no los pasa y la lista queda en blanco.
 */
export function refresco(onRefrescar: (() => void) | undefined, refrescando: boolean) {
  if (!onRefrescar) return undefined;
  return (
    <RefreshControl
      refreshing={refrescando}
      onRefresh={onRefrescar}
      colors={[colores.primario]}
      tintColor={colores.primario}
    />
  );
}

/** Lista con estados de carga, vacío (con sugerencias) y error con «Reintentar». */
export function ListaEstados<T>(p: Props<T>) {
  if (p.estado === "cargando") return <EstadoCargando />;
  if (p.estado === "error") return <EstadoError mensaje={p.mensajeError} onReintentar={p.onReintentar} />;
  if (p.estado === "vacio")
    return <EstadoVacio titulo={p.tituloVacio} icono={p.iconoVacio} sugerencias={p.sugerencias} />;
  const pie = p.cargandoMas ? <ActivityIndicator color={colores.primario} style={{ margin: 16 }} /> : undefined;
  return (
    <FlatList
      data={p.datos}
      renderItem={p.renderItem}
      keyExtractor={p.keyExtractor}
      ListHeaderComponent={p.encabezado ?? undefined}
      contentContainerStyle={estilos.contenido}
      refreshControl={refresco(p.onRefrescar, !!p.refrescando)}
      onEndReached={p.onFinal}
      onEndReachedThreshold={0.5}
      ListFooterComponent={pie}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const estilos = StyleSheet.create({
  contenido: {
    padding: espacio.l,
    gap: espacio.m,
    width: "100%",
    maxWidth: ANCHO_MAX,
    alignSelf: "center",
    paddingBottom: 40,
  },
});
