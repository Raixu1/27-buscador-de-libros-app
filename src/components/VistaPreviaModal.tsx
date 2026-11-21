import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { sinopsis } from "@/api/endpoints";
import { Boton } from "@/components/Boton";
import { colores } from "@/theme";
import type { LibroResumen } from "@/types";

type Props = { libro: LibroResumen | null; onCerrar: () => void };

/** Vista previa de la sinopsis (pulsación larga o botón «Sinopsis»). */
export function VistaPreviaModal({ libro, onCerrar }: Props) {
  const [texto, setTexto] = useState<string | null>(null);
  const [estado, setEstado] = useState<"cargando" | "ok" | "error">("cargando");

  const cargar = useCallback(async (id: string) => {
    setEstado("cargando");
    try {
      const r = await sinopsis(id);
      setTexto(r.descripcion);
      setEstado("ok");
    } catch {
      setEstado("error");
    }
  }, []);

  useEffect(() => {
    if (libro) cargar(libro.id);
  }, [libro, cargar]);

  return (
    <Modal visible={!!libro} transparent animationType="fade" onRequestClose={onCerrar}>
      <View style={estilos.fondo}>
        <View style={estilos.caja} accessibilityViewIsModal>
          <Text style={estilos.titulo} accessibilityRole="header">
            {libro?.titulo}
          </Text>
          <ScrollView style={{ maxHeight: 320 }}>
            {estado === "cargando" ? <ActivityIndicator color={colores.primario} accessibilityLabel="Cargando sinopsis" /> : null}
            {estado === "ok" ? (
              <Text style={estilos.texto}>{texto ?? "Este libro no tiene sinopsis disponible."}</Text>
            ) : null}
            {estado === "error" ? <Text style={estilos.error}>No se pudo cargar la sinopsis.</Text> : null}
          </ScrollView>
          {estado === "error" && libro ? (
            <Boton titulo="Reintentar" variante="secundario" onPress={() => cargar(libro.id)} />
          ) : null}
          <Boton titulo="Cerrar" accessibilityLabel="Cerrar vista previa" onPress={onCerrar} />
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 },
  caja: { backgroundColor: colores.tarjeta, borderRadius: 14, padding: 20, gap: 12 },
  titulo: { fontSize: 20, fontWeight: "800", color: colores.texto },
  texto: { fontSize: 15, lineHeight: 22, color: colores.texto },
  error: { fontSize: 15, color: colores.error },
});
