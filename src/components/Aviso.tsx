import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { Icono } from "@/components/Icono";
import { colores, radio, sombraFuerte } from "@/theme";

export type DatosAviso = { texto: string; error?: boolean } | null;

/** Muestra un aviso y lo oculta solo a los 3 s. */
export function useAviso(): [DatosAviso, (texto: string, error?: boolean) => void] {
  const [aviso, setAviso] = useState<DatosAviso>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mostrar = useCallback((texto: string, error = false) => {
    if (timer.current) clearTimeout(timer.current);
    setAviso({ texto, error });
    timer.current = setTimeout(() => setAviso(null), 3000);
  }, []);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return [aviso, mostrar];
}

/** Aviso flotante en la parte inferior; lo anuncian los lectores de pantalla. */
export function Aviso({ aviso }: { aviso: DatosAviso }) {
  if (!aviso) return null;
  return (
    <View style={estilos.contenedor} pointerEvents="none">
      <Animated.View
        entering={FadeInDown}
        exiting={FadeOutDown}
        style={[estilos.caja, { backgroundColor: aviso.error ? colores.error : colores.texto }]}
        accessibilityLiveRegion="polite"
        accessibilityRole={aviso.error ? "alert" : undefined}
      >
        <Icono nombre={aviso.error ? "alert-circle" : "checkmark-circle"} color="#FFFFFF" />
        <Text style={estilos.texto} numberOfLines={2}>
          {aviso.texto}
        </Text>
      </Animated.View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { position: "absolute", left: 16, right: 16, bottom: 16, alignItems: "center" },
  caja: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radio.m,
    maxWidth: 520,
    ...sombraFuerte,
  },
  texto: { color: "#FFFFFF", fontWeight: "600", fontSize: 14, flexShrink: 1 },
});
