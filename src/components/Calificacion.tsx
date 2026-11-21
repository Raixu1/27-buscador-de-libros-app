import { Pressable, StyleSheet, View } from "react-native";
import { Icono } from "@/components/Icono";
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
            style={({ pressed }) => [estilos.estrella, pressed && { transform: [{ scale: 0.9 }] }]}
          >
            <Icono nombre={activa ? "star" : "star-outline"} tam={34} color={activa ? colores.estrella : "#C9C3B8"} />
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: "row", gap: 2 },
  estrella: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
});
