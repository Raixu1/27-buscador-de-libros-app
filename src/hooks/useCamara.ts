import { CameraView, useCameraPermissions } from "expo-camera";
import { useCallback, useEffect, useState } from "react";

export type ModoCamara = "no-disponible" | "visor" | "pedir";

/**
 * Comprueba si hay cámara (isAvailableAsync) y pide el permiso solo cuando el usuario activa la función.
 * Devuelve qué mostrar: el visor, el botón para activarla o el aviso de que no existe.
 */
export function useCamara(onSinPermiso: () => void) {
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [disponible, setDisponible] = useState<boolean | null>(null);
  const [activa, setActiva] = useState(false);

  useEffect(() => {
    CameraView.isAvailableAsync()
      .then(setDisponible)
      .catch(() => setDisponible(false));
  }, []);

  const activar = useCallback(async () => {
    const r = permiso?.granted ? permiso : await pedirPermiso();
    setActiva(r.granted);
    if (!r.granted) onSinPermiso();
  }, [permiso, pedirPermiso, onSinPermiso]);

  let modo: ModoCamara = "pedir";
  if (disponible === false) modo = "no-disponible";
  else if (activa && permiso?.granted) modo = "visor";
  return { modo, activar };
}
