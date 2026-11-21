import { Gesture } from "react-native-gesture-handler";
import { interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const UMBRAL_DESLIZAR = 90;

/**
 * Gestos de la tarjeta: deslizar a la derecha (agregar) y pulsación larga (vista previa).
 * `habilitado` desactiva el deslizamiento si el libro ya está en la lista.
 */
export function useDeslizarParaAgregar(habilitado: boolean, onAgregar: () => void, onPrevia: () => void) {
  const x = useSharedValue(0);

  const deslizar = Gesture.Pan()
    .enabled(habilitado)
    .activeOffsetX([-15, 15])
    .failOffsetY([-12, 12])
    .onUpdate((e) => {
      x.value = Math.max(0, Math.min(140, e.translationX));
    })
    .onEnd((e) => {
      if (e.translationX > UMBRAL_DESLIZAR) runOnJS(onAgregar)();
      x.value = withSpring(0);
    });

  const pulsacionLarga = Gesture.LongPress()
    .minDuration(450)
    .onStart(() => {
      runOnJS(onPrevia)();
    });

  const estiloTarjeta = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const estiloFondo = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [0, UMBRAL_DESLIZAR], [0, 1]) }));

  return { gesto: Gesture.Race(deslizar, pulsacionLarga), estiloTarjeta, estiloFondo };
}
