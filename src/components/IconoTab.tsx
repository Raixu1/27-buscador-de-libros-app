import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import type { ColorValue } from "react-native";

type Nombre = ComponentProps<typeof Ionicons>["name"];
type PropsIcono = { color: ColorValue; focused: boolean; size: number };

/**
 * Icono de una pestaña. El color llega de la navegación y se pasa sin modificar:
 * en Android puede ser un color nativo (objeto), y convertirlo a texto rompe el render.
 */
export function iconoTab(activo: Nombre, inactivo: Nombre) {
  return function IconoTab({ color, focused, size }: PropsIcono) {
    // Un color numérico (ya procesado) no lo acepta Ionicons: se usa su color por defecto.
    const valor = typeof color === "number" ? undefined : (color ?? undefined);
    return <Ionicons name={focused ? activo : inactivo} color={valor} size={size} />;
  };
}
