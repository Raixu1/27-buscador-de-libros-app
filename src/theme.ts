import { Platform, type ViewStyle } from "react-native";
import type { Estado } from "@/types";

export const colores = {
  fondo: "#F6F3EE",
  tarjeta: "#FFFFFF",
  texto: "#1E1B2E",
  suave: "#6B6880",
  primario: "#4F46E5",
  primarioOscuro: "#312E81",
  primarioSuave: "#EEF2FF",
  primarioTexto: "#FFFFFF",
  acento: "#F59E0B",
  borde: "#E7E2DA",
  error: "#DC2626",
  errorSuave: "#FEE2E2",
  ok: "#047857",
  okSuave: "#D1FAE5",
  estrella: "#F59E0B",
};

/** Degradado de las cabeceras. */
export const degradado = ["#312E81", "#4F46E5", "#7C3AED"] as const;

export const colorEstado: Record<
  Estado,
  { texto: string; fondo: string; icono: "bookmark" | "book" | "checkmark-circle" }
> = {
  quiero: { texto: "#1D4ED8", fondo: "#DBEAFE", icono: "bookmark" },
  leyendo: { texto: "#B45309", fondo: "#FEF3C7", icono: "book" },
  leido: { texto: "#047857", fondo: "#D1FAE5", icono: "checkmark-circle" },
};

export const espacio = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 };
export const radio = { s: 8, m: 12, l: 18, pill: 999 };

export const sombra: ViewStyle = Platform.select<ViewStyle>({
  android: { elevation: 3 },
  default: { shadowColor: "#1E1B2E", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
});

export const sombraFuerte: ViewStyle = Platform.select<ViewStyle>({
  android: { elevation: 8 },
  default: { shadowColor: "#1E1B2E", shadowOpacity: 0.22, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } },
});

/** Ancho máximo del contenido (para que se vea bien en tablet o web). */
export const ANCHO_MAX = 560;
