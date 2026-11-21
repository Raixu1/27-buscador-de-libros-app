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

function Refresco({ onRefrescar, refrescando }: { onRefrescar: () => void; refrescando: boolean }) {
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
      refreshControl={
        p.onRefrescar ? <Refresco onRefrescar={p.onRefrescar} refrescando={!!p.refrescando} /> : undefined
      }
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
