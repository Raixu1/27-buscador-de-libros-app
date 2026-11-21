import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { Icono } from "@/components/Icono";
import { colorEstado, colores, radio } from "@/theme";
import { ESTADOS, type Estado } from "@/types";

type Props = { valor: Estado | null; onCambiar: (e: Estado | null) => void; incluirTodos?: boolean };

/** Selector de estado. Con `incluirTodos` sirve como filtro (RF-05). */
export function FiltroEstado({ valor, onCambiar, incluirTodos }: Props) {
  const opciones: { valor: Estado | null; etiqueta: string }[] = [
    ...(incluirTodos ? [{ valor: null, etiqueta: "Todos" }] : []),
    ...ESTADOS,
  ];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.fila}>
      {opciones.map((o) => {
        const activo = o.valor === valor;
        const c = o.valor ? colorEstado[o.valor] : null;
        const colorActivo = c?.texto ?? colores.primario;
        return (
          <Pressable
            key={o.etiqueta}
            onPress={() => onCambiar(o.valor)}
            accessibilityRole="button"
            accessibilityState={{ selected: activo }}
            accessibilityLabel={incluirTodos ? `Filtrar por ${o.etiqueta}` : `Estado ${o.etiqueta}`}
            style={[estilos.chip, activo && { backgroundColor: colorActivo, borderColor: colorActivo }]}
          >
            <Icono nombre={c?.icono ?? "albums"} tam={15} color={activo ? "#FFFFFF" : colores.suave} />
            <Text style={[estilos.texto, activo && { color: "#FFFFFF" }]}>{o.etiqueta}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  fila: { gap: 8, paddingVertical: 2 },
  chip: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: radio.pill,
    borderWidth: 1.5,
    borderColor: colores.borde,
    backgroundColor: colores.tarjeta,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  texto: { color: colores.texto, fontWeight: "700", fontSize: 14 },
});
