import { Pressable, StyleSheet, Text, View } from "react-native";
import { colores } from "@/theme";

type Props = { valor: number | null; onCambiar: (v: number | null) => void; deshabilitado?: boolean };

export function Calificacion({ valor, onCambiar, deshabilitado }: Props) {
  return (
    <View style={estilos.fila} accessibilityRole="radiogroup" accessibilityLabel="Calificación de 1 a 5">
      {[1, 2, 3, 4, 5].map((n) => {
        const activa = valor !== null && n <= valor;
        return (
          <Pressable
            key={n}
            disabled={deshabilitado}
            onPress={() => onCambiar(valor === n ? null : n)}
            accessibilityRole="radio"
            accessibilityState={{ selected: valor === n, disabled: !!deshabilitado }}
            accessibilityLabel={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
            style={estilos.estrella}
          >
            <Text style={[estilos.texto, { color: activa ? colores.estrella : colores.borde }]}>★</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: "row", gap: 4 },
  estrella: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  texto: { fontSize: 34 },
});
