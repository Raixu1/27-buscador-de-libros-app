import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";
import { colores } from "@/theme";

type Props = {
  titulo: string;
  onPress: () => void;
  accessibilityLabel?: string;
  variante?: "primario" | "secundario" | "peligro";
  deshabilitado?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Boton({ titulo, onPress, accessibilityLabel, variante = "primario", deshabilitado, style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? titulo}
      accessibilityState={{ disabled: !!deshabilitado }}
      disabled={deshabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.base,
        variante === "primario" && estilos.primario,
        variante === "secundario" && estilos.secundario,
        variante === "peligro" && estilos.peligro,
        (pressed || deshabilitado) && { opacity: 0.6 },
        style,
      ]}
    >
      <Text style={[estilos.texto, variante !== "primario" && { color: variante === "peligro" ? colores.error : colores.primario }]}>
        {titulo}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: { minHeight: 48, paddingHorizontal: 16, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  primario: { backgroundColor: colores.primario },
  secundario: { borderWidth: 1, borderColor: colores.primario, backgroundColor: "transparent" },
  peligro: { borderWidth: 1, borderColor: colores.error, backgroundColor: "transparent" },
  texto: { color: colores.primarioTexto, fontSize: 16, fontWeight: "600" },
});
