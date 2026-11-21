import type { ReactElement } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View, type ListRenderItem } from "react-native";
import { Boton } from "@/components/Boton";
import { Icono, type NombreIcono } from "@/components/Icono";
import { ANCHO_MAX, colores, espacio, radio } from "@/theme";

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

function Aviso({ icono, color, fondo, titulo, children }: { icono: NombreIcono; color: string; fondo: string; titulo: string; children?: React.ReactNode }) {
  return (
    <View style={estilos.centro}>
      <View style={[estilos.circulo, { backgroundColor: fondo }]}>
        <Icono nombre={icono} tam={36} color={color} />
      </View>
      <Text style={estilos.titulo}>{titulo}</Text>
      {children}
    </View>
  );
}

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
      <View style={{ flex: 1 }} accessibilityRole="alert">
        <Aviso icono="cloud-offline-outline" color={colores.error} fondo={colores.errorSuave} titulo="Algo salió mal">
          <Text style={estilos.suave}>{p.mensajeError ?? "No se pudo completar la operación."}</Text>
          {p.onReintentar ? (
            <Boton titulo="Reintentar" icono="refresh" onPress={p.onReintentar} accessibilityLabel="Reintentar" />
          ) : null}
        </Aviso>
      </View>
    );
  }
  if (p.estado === "vacio") {
    return (
      <Aviso icono={p.iconoVacio ?? "search-outline"} color={colores.primario} fondo={colores.primarioSuave} titulo={p.tituloVacio}>
        {p.sugerencias?.length ? (
          <View accessibilityLabel="Sugerencias" style={estilos.sugerencias}>
            <Text style={estilos.sugerenciasTitulo}>Prueba con:</Text>
            {p.sugerencias.map((s) => (
              <Text key={s} style={estilos.suave}>
                • {s}
              </Text>
            ))}
          </View>
        ) : null}
      </Aviso>
    );
  }
  return (
    <FlatList
      data={p.datos}
      renderItem={p.renderItem}
      keyExtractor={p.keyExtractor}
      ListHeaderComponent={p.encabezado ?? undefined}
      contentContainerStyle={estilos.contenido}
      refreshControl={
        p.onRefrescar ? (
          <RefreshControl refreshing={!!p.refrescando} onRefresh={p.onRefrescar} colors={[colores.primario]} tintColor={colores.primario} />
        ) : undefined
      }
      onEndReached={p.onFinal}
      onEndReachedThreshold={0.5}
      ListFooterComponent={p.cargandoMas ? <ActivityIndicator color={colores.primario} style={{ margin: 16 }} /> : undefined}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center", padding: espacio.xl, gap: espacio.m },
  circulo: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  titulo: { fontSize: 19, fontWeight: "800", color: colores.texto, textAlign: "center" },
  suave: { fontSize: 15, color: colores.suave, textAlign: "center", lineHeight: 22 },
  sugerencias: { backgroundColor: colores.tarjeta, borderRadius: radio.m, padding: espacio.l, gap: 4, alignSelf: "stretch", maxWidth: 360 },
  sugerenciasTitulo: { fontSize: 14, fontWeight: "700", color: colores.texto, textAlign: "center", marginBottom: 2 },
  contenido: { padding: espacio.l, gap: espacio.m, width: "100%", maxWidth: ANCHO_MAX, alignSelf: "center", paddingBottom: 40 },
});
