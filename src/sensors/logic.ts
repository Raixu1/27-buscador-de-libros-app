// Lógica pura de sensores (sin imports nativos) para poder probarla sin dispositivo.

export type Muestra = { x: number; y: number; z: number };

/** ¿Esta muestra del acelerómetro (en g) supera el umbral de sacudida? En reposo ≈ 1 g. */
export function esSacudida(m: Muestra, umbral = 1.8): boolean {
  return Math.sqrt(m.x * m.x + m.y * m.y + m.z * m.z) > umbral;
}

/** Detector con enfriamiento para no disparar varias veces por la misma sacudida. */
export function crearDetectorSacudida(umbral = 1.8, enfriamientoMs = 1000) {
  let ultimo = -Infinity;
  return (m: Muestra, ahora: number): boolean => {
    if (!esSacudida(m, umbral) || ahora - ultimo < enfriamientoMs) return false;
    ultimo = ahora;
    return true;
  };
}

/** Integra la velocidad angular (rad/s) durante dt (s) y limita el ángulo (grados). */
export function integrarInclinacion(angulo: number, velocidad: number, dt: number, maxGrados = 15): number {
  const siguiente = angulo + (velocidad * dt * 180) / Math.PI;
  // Decae hacia 0 para que la portada vuelva a su sitio.
  return Math.max(-maxGrados, Math.min(maxGrados, siguiente * 0.95));
}
