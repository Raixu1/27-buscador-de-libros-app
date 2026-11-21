import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Boton } from "@/components/Boton";
import { Icono, type NombreIcono } from "@/components/Icono";
import { colores, espacio, radio } from "@/theme";

type AvisoProps = { icono: NombreIcono; color: string; fondo: string; titulo: string; children?: ReactNode };

function AvisoCentral({ icono, color, fondo, titulo, children }: AvisoProps) {
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

export function EstadoCargando() {
  return (
    <View style={estilos.centro} accessibilityRole="progressbar" accessibilityLabel="Cargando">
      <ActivityIndicator size="large" color={colores.primario} />
      <Text style={estilos.suave}>Cargando…</Text>
    </View>
  );
}

export function EstadoError({ mensaje, onReintentar }: { mensaje?: string; onReintentar?: () => void }) {
  return (
    <View style={{ flex: 1 }} accessibilityRole="alert">
      <AvisoCentral
        icono="cloud-offline-outline"
        color={colores.error}
        fondo={colores.errorSuave}
        titulo="Algo salió mal"
      >
        <Text style={estilos.suave}>{mensaje ?? "No se pudo completar la operación."}</Text>
        {onReintentar ? (
          <Boton titulo="Reintentar" icono="refresh" onPress={onReintentar} accessibilityLabel="Reintentar" />
        ) : null}
      </AvisoCentral>
    </View>
  );
}

type VacioProps = { titulo: string; icono?: NombreIcono; sugerencias?: string[] };

export function EstadoVacio({ titulo, icono, sugerencias }: VacioProps) {
  return (
    <AvisoCentral
      icono={icono ?? "search-outline"}
      color={colores.primario}
      fondo={colores.primarioSuave}
      titulo={titulo}
    >
      {sugerencias?.length ? (
        <View accessibilityLabel="Sugerencias" style={estilos.sugerencias}>
          <Text style={estilos.sugerenciasTitulo}>Prueba con:</Text>
          {sugerencias.map((s) => (
            <Text key={s} style={estilos.suave}>
              • {s}
            </Text>
          ))}
        </View>
      ) : null}
    </AvisoCentral>
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center", padding: espacio.xl, gap: espacio.m },
  circulo: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  titulo: { fontSize: 19, fontWeight: "800", color: colores.texto, textAlign: "center" },
  suave: { fontSize: 15, color: colores.suave, textAlign: "center", lineHeight: 22 },
  sugerencias: {
    backgroundColor: colores.tarjeta,
    borderRadius: radio.m,
    padding: espacio.l,
    gap: 4,
    alignSelf: "stretch",
    maxWidth: 360,
  },
  sugerenciasTitulo: { fontSize: 14, fontWeight: "700", color: colores.texto, textAlign: "center", marginBottom: 2 },
});
