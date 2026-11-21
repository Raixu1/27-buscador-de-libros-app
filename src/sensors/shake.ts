import { useEffect, useRef, useState } from "react";
import { Accelerometer } from "expo-sensors";
import { crearDetectorSacudida } from "@/sensors/logic";

/** Escucha el acelerómetro mientras `activo`. Devuelve si el sensor está disponible. */
export function useShake(alSacudir: () => void, activo: boolean): { disponible: boolean } {
  const [disponible, setDisponible] = useState(false);
  const callback = useRef(alSacudir);

  // La referencia se actualiza después de cada render (no durante el render).
  useEffect(() => {
    callback.current = alSacudir;
  });

  useEffect(() => {
    if (!activo) return;
    let cancelado = false;
    let suscripcion: { remove: () => void } | null = null;
    (async () => {
      try {
        const ok = await Accelerometer.isAvailableAsync();
        if (cancelado) return;
        setDisponible(ok);
        if (!ok) return;
        Accelerometer.setUpdateInterval(100);
        const detectar = crearDetectorSacudida();
        suscripcion = Accelerometer.addListener((m) => {
          if (detectar(m, Date.now())) callback.current();
        });
      } catch {
        setDisponible(false);
      }
    })();
    return () => {
      cancelado = true;
      suscripcion?.remove();
    };
  }, [activo]);

  return { disponible };
}
