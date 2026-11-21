import { useCallback } from "react";
import { Gesture } from "react-native-gesture-handler";
import { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useTilt } from "@/sensors/tilt";

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;

const limitarZoom = (v: number) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, v));

/** Pellizco para zoom (con botones equivalentes) e inclinación con el giroscopio. */
export function usePortadaInteractiva() {
  const escala = useSharedValue(1);
  const base = useSharedValue(1);
  const { rotX, rotY } = useTilt(true);

  const pellizco = Gesture.Pinch()
    .onUpdate((e) => {
      escala.value = limitarZoom(base.value * e.scale);
    })
    .onEnd(() => {
      base.value = escala.value;
    });

  const zoom = useCallback(
    (delta: number) => {
      // get()/set() en lugar de .value: compatibles con React Compiler fuera de worklets.
      const nuevo = limitarZoom(base.get() + delta);
      base.set(nuevo);
      escala.set(withSpring(nuevo));
    },
    [base, escala],
  );

  const estilo = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateX: `${-rotX.value}deg` },
      { rotateY: `${rotY.value}deg` },
      { scale: escala.value },
    ],
  }));

  return { pellizco, zoom, estilo };
}
