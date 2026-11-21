import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Alert } from "react-native";
import { quitarLibro, repositorio, sincronizarAhora } from "@/services/listaService";
import type { LibroResumen } from "@/types";

/** Pide confirmación, hace el borrado lógico local y vuelve atrás. */
export function useQuitarLibro(libro: LibroResumen) {
  const router = useRouter();
  return useCallback(() => {
    const confirmar = async () => {
      await quitarLibro(await repositorio(), libro.id);
      sincronizarAhora().catch(() => undefined);
      router.back();
    };
    Alert.alert("Quitar de mi lista", `¿Quitar «${libro.titulo}» de tu lista?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Quitar", style: "destructive", onPress: confirmar },
    ]);
  }, [libro, router]);
}
