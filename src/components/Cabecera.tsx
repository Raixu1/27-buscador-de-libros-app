import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ANCHO_MAX, degradado, espacio } from "@/theme";

type Props = { titulo: string; subtitulo?: string; derecha?: ReactNode; children?: ReactNode };

/** Cabecera de pantalla con degradado; `children` queda superpuesto al borde inferior. */
export function Cabecera({ titulo, subtitulo, derecha, children }: Props) {
  const { top } = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={degradado}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[estilos.fondo, { paddingTop: top + espacio.l }]}
    >
      {/* Círculos decorativos */}
      <View style={[estilos.circulo, { width: 180, height: 180, top: -60, right: -40 }]} pointerEvents="none" />
      <View style={[estilos.circulo, { width: 90, height: 90, bottom: -20, left: -30 }]} pointerEvents="none" />
      <View style={estilos.contenido}>
        <View style={estilos.fila}>
          <View style={{ flex: 1 }}>
            <Text style={estilos.titulo} accessibilityRole="header">
              {titulo}
            </Text>
            {subtitulo ? <Text style={estilos.subtitulo}>{subtitulo}</Text> : null}
          </View>
          {derecha}
        </View>
        {children}
      </View>
    </LinearGradient>
  );
}

const estilos = StyleSheet.create({
  fondo: {
    paddingHorizontal: espacio.l,
    paddingBottom: espacio.l,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  circulo: { position: "absolute", borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)" },
  contenido: { width: "100%", maxWidth: ANCHO_MAX, alignSelf: "center", gap: espacio.m },
  fila: { flexDirection: "row", alignItems: "center", gap: espacio.m },
  titulo: { color: "#FFFFFF", fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  subtitulo: { color: "rgba(255,255,255,0.82)", fontSize: 15, marginTop: 2 },
});
