import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { Icono, type NombreIcono } from "@/components/Icono";
import { colores, radio } from "@/theme";

type Props = TextInputProps & {
  icono?: NombreIcono;
  /** Muestra un botón para borrar el texto. */
  onLimpiar?: () => void;
  error?: boolean;
};

/** Campo de texto con icono, estado de foco y botón opcional para borrar. */
export function Campo({ icono, onLimpiar, error, style, ...props }: Props) {
  const [foco, setFoco] = useState(false);
  const borde = error ? colores.error : foco ? colores.primario : colores.borde;
  return (
    <View style={[estilos.caja, { borderColor: borde }, foco && estilos.foco]}>
      {icono ? <Icono nombre={icono} color={foco ? colores.primario : colores.suave} /> : null}
      <TextInput
        placeholderTextColor={colores.suave}
        {...props}
        onFocus={(e) => {
          setFoco(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFoco(false);
          props.onBlur?.(e);
        }}
        style={[estilos.input, style]}
      />
      {onLimpiar && props.value ? (
        <Pressable onPress={onLimpiar} accessibilityRole="button" accessibilityLabel="Borrar texto" hitSlop={12}>
          <Icono nombre="close-circle" color={colores.suave} />
        </Pressable>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: radio.m,
    borderWidth: 1.5,
    backgroundColor: colores.tarjeta,
  },
  foco: { backgroundColor: "#FDFDFF" },
  input: { flex: 1, fontSize: 16, color: colores.texto, paddingVertical: 12 },
});
