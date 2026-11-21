import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { colores } from "@/theme";
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
        return (
          <Pressable
            key={o.etiqueta}
            onPress={() => onCambiar(o.valor)}
            accessibilityRole="button"
            accessibilityState={{ selected: activo }}
            accessibilityLabel={incluirTodos ? `Filtrar por ${o.etiqueta}` : `Estado ${o.etiqueta}`}
            style={[estilos.chip, activo && estilos.chipActivo]}
          >
            <Text style={[estilos.texto, activo && { color: colores.primarioTexto }]}>{o.etiqueta}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  fila: { gap: 8, paddingVertical: 4 },
  chip: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colores.primario,
    justifyContent: "center",
  },
  chipActivo: { backgroundColor: colores.primario },
  texto: { color: colores.primario, fontWeight: "600" },
});
