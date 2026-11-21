import type { ReactElement } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View, type ListRenderItem } from "react-native";
import { Boton } from "@/components/Boton";
import { colores, espacio } from "@/theme";

export type EstadoLista = "cargando" | "error" | "vacio" | "ok";

type Props<T> = {
  estado: EstadoLista;
  datos: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T) => string;
  mensajeError?: string;
  onReintentar?: () => void;
  tituloVacio: string;
  sugerencias?: string[];
  onRefrescar?: () => void;
  refrescando?: boolean;
  onFinal?: () => void;
  cargandoMas?: boolean;
  encabezado?: ReactElement | null;
};

/** Lista con estados de carga, vacío (con sugerencias) y error con «Reintentar». */
export function ListaEstados<T>(p: Props<T>) {
  if (p.estado === "cargando") {
    return (
      <View style={estilos.centro} accessibilityRole="progressbar" accessibilityLabel="Cargando">
        <ActivityIndicator size="large" color={colores.primario} />
        <Text style={estilos.suave}>Cargando…</Text>
      </View>
    );
  }
  if (p.estado === "error") {
    return (
      <View style={estilos.centro} accessibilityRole="alert">
        <Text style={estilos.titulo}>Algo salió mal</Text>
        <Text style={estilos.suave}>{p.mensajeError ?? "No se pudo completar la operación."}</Text>
        {p.onReintentar ? <Boton titulo="Reintentar" onPress={p.onReintentar} accessibilityLabel="Reintentar" /> : null}
      </View>
    );
  }
  if (p.estado === "vacio") {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.titulo}>{p.tituloVacio}</Text>
        {p.sugerencias?.length ? (
          <View accessibilityLabel="Sugerencias">
            <Text style={estilos.suave}>Prueba con:</Text>
            {p.sugerencias.map((s) => (
              <Text key={s} style={estilos.suave}>
                • {s}
              </Text>
            ))}
          </View>
        ) : null}
      </View>
    );
  }
  return (
    <FlatList
      data={p.datos}
      renderItem={p.renderItem}
      keyExtractor={p.keyExtractor}
      ListHeaderComponent={p.encabezado ?? undefined}
      contentContainerStyle={{ padding: espacio.l, gap: espacio.m }}
      refreshControl={
        p.onRefrescar ? <RefreshControl refreshing={!!p.refrescando} onRefresh={p.onRefrescar} /> : undefined
      }
      onEndReached={p.onFinal}
      onEndReachedThreshold={0.5}
      ListFooterComponent={p.cargandoMas ? <ActivityIndicator color={colores.primario} /> : undefined}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  titulo: { fontSize: 18, fontWeight: "700", color: colores.texto, textAlign: "center" },
  suave: { fontSize: 15, color: colores.suave, textAlign: "center" },
});
