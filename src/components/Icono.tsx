import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";

export type NombreIcono = ComponentProps<typeof Ionicons>["name"];

/** Icono decorativo: los lectores de pantalla lo ignoran (la etiqueta va en el control). */
export function Icono({ nombre, tam = 20, color }: { nombre: NombreIcono; tam?: number; color: string }) {
  return (
    <Ionicons
      name={nombre}
      size={tam}
      color={color}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
