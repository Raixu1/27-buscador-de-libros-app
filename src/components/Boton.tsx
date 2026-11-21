import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";
import { Icono, type NombreIcono } from "@/components/Icono";
import { colores, radio, sombra } from "@/theme";

type Variante = "primario" | "secundario" | "peligro" | "fantasma";

type Props = {
  titulo: string;
  onPress: () => void;
  accessibilityLabel?: string;
  variante?: Variante;
  icono?: NombreIcono;
  deshabilitado?: boolean;
  compacto?: boolean;
  style?: StyleProp<ViewStyle>;
};

const COLOR_TEXTO: Record<Variante, string> = {
  primario: colores.primarioTexto,
  secundario: colores.primario,
  peligro: colores.error,
  fantasma: colores.primario,
};

export function Boton({
  titulo,
  onPress,
  accessibilityLabel,
  variante = "primario",
  icono,
  deshabilitado,
  compacto,
  style,
}: Props) {
  const color = COLOR_TEXTO[variante];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? titulo}
      accessibilityState={{ disabled: !!deshabilitado }}
      disabled={deshabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.base,
        compacto && estilos.compacto,
        estilos[variante],
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        deshabilitado && { opacity: 0.5 },
        style,
      ]}
    >
      {icono ? <Icono nombre={icono} tam={compacto ? 16 : 18} color={color} /> : null}
      <Text style={[estilos.texto, compacto && { fontSize: 14 }, { color }]}>{titulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: 20,
    borderRadius: radio.m,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  compacto: { minHeight: 44, paddingHorizontal: 14, borderRadius: radio.pill },
  primario: { backgroundColor: colores.primario, ...sombra },
  secundario: { backgroundColor: colores.primarioSuave },
  peligro: { backgroundColor: colores.errorSuave },
  fantasma: { backgroundColor: "transparent" },
  texto: { fontSize: 16, fontWeight: "700", letterSpacing: 0.2 },
});
