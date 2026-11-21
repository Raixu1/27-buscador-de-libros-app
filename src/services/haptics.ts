import * as Haptics from "expo-haptics";

/** Retroalimentación háptica que nunca rompe la app si el dispositivo no la soporta. */
export function vibrarExito(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}

export function vibrarLigero(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}
