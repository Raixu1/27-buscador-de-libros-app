import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { Icono } from "@/components/Icono";
import { colores, sombra } from "@/theme";

type Props = { url: string | null; titulo: string; ancho?: number; alto?: number };

/** Portada con sombra. Sin imagen, muestra un lomo con las iniciales del título. */
export function Portada({ url, titulo, ancho = 64, alto = 96 }: Props) {
  const radioPortada = Math.max(6, ancho * 0.06);
  const marco = [{ width: ancho, height: alto, borderRadius: radioPortada }, sombra];
  if (!url) {
    const iniciales = titulo
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
    return (
      <View style={marco} accessible accessibilityLabel={`Sin portada para ${titulo}`}>
        <LinearGradient
          colors={["#6366F1", "#8B5CF6"]}
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: radioPortada, alignItems: "center", justifyContent: "center", gap: 4 },
          ]}
        >
          <Icono nombre="book" tam={ancho * 0.3} color="rgba(255,255,255,0.9)" />
          {ancho >= 80 ? <Text style={[estilos.iniciales, { fontSize: ancho * 0.16 }]}>{iniciales}</Text> : null}
        </LinearGradient>
      </View>
    );
  }
  return (
    <View style={marco}>
      <Image
        source={{ uri: url }}
        style={{ width: ancho, height: alto, borderRadius: radioPortada, backgroundColor: colores.borde }}
        contentFit="cover"
        transition={200}
        accessibilityLabel={`Portada de ${titulo}`}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  iniciales: { color: "#FFFFFF", fontWeight: "800", letterSpacing: 1 },
});
