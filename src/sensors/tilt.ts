import { useEffect, useState } from "react";
import { Gyroscope } from "expo-sensors";
import { useSharedValue } from "react-native-reanimated";
import { integrarInclinacion } from "@/sensors/logic";

/** Efecto de inclinación con el giroscopio. Si no está disponible, la portada queda estática. */
export function useTilt(activo: boolean) {
  const rotX = useSharedValue(0);
  const rotY = useSharedValue(0);
  const [disponible, setDisponible] = useState(false);

  useEffect(() => {
    if (!activo) return;
    let cancelado = false;
    let suscripcion: { remove: () => void } | null = null;
    (async () => {
      try {
        const ok = await Gyroscope.isAvailableAsync();
        if (cancelado) return;
        setDisponible(ok);
        if (!ok) return;
        const intervalo = 50;
        Gyroscope.setUpdateInterval(intervalo);
        suscripcion = Gyroscope.addListener((g) => {
          rotX.value = integrarInclinacion(rotX.value, g.x, intervalo / 1000);
          rotY.value = integrarInclinacion(rotY.value, g.y, intervalo / 1000);
        });
      } catch {
        setDisponible(false);
      }
    })();
    return () => {
      cancelado = true;
      suscripcion?.remove();
      rotX.value = 0;
      rotY.value = 0;
    };
  }, [activo, rotX, rotY]);

  return { rotX, rotY, disponible };
}
