import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { colores } from "@/theme";

type Props = { url: string | null; titulo: string; ancho?: number; alto?: number };

export function Portada({ url, titulo, ancho = 64, alto = 96 }: Props) {
  if (!url) {
    return (
      <View
        style={[estilos.vacia, { width: ancho, height: alto }]}
        accessible
        accessibilityLabel={`Sin portada para ${titulo}`}
      >
        <Text style={estilos.icono}>📖</Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri: url }}
      style={{ width: ancho, height: alto, borderRadius: 6, backgroundColor: colores.borde }}
      contentFit="cover"
      accessibilityLabel={`Portada de ${titulo}`}
    />
  );
}

const estilos = StyleSheet.create({
  vacia: { borderRadius: 6, backgroundColor: colores.borde, alignItems: "center", justifyContent: "center" },
  icono: { fontSize: 28 },
});
