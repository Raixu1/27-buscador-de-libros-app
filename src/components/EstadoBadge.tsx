import { StyleSheet, Text, View } from "react-native";
import { Icono } from "@/components/Icono";
import { colorEstado, radio } from "@/theme";
import { etiquetaEstado, type Estado } from "@/types";

export function EstadoBadge({ estado }: { estado: Estado }) {
  const c = colorEstado[estado];
  return (
    <View style={[estilos.badge, { backgroundColor: c.fondo }]}>
      <Icono nombre={c.icono} tam={13} color={c.texto} />
      <Text style={[estilos.texto, { color: c.texto }]}>{etiquetaEstado(estado)}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radio.pill,
  },
  texto: { fontSize: 12, fontWeight: "700" },
});
