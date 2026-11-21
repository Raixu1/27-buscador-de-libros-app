import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { sinopsis } from "@/api/endpoints";
import { Boton } from "@/components/Boton";
import { Icono } from "@/components/Icono";
import { Portada } from "@/components/Portada";
import { colores, radio, sombraFuerte } from "@/theme";
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
      <Pressable style={estilos.fondo} onPress={onCerrar} accessibilityLabel="Cerrar vista previa">
        <Pressable style={estilos.caja} accessibilityViewIsModal onPress={() => undefined}>
          <View style={estilos.cabecera}>
            {libro ? <Portada url={libro.portada_url} titulo={libro.titulo} ancho={60} alto={90} /> : null}
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={estilos.etiqueta}>SINOPSIS</Text>
              <Text style={estilos.titulo} accessibilityRole="header" numberOfLines={3}>
                {libro?.titulo}
              </Text>
              <Text style={estilos.autor} numberOfLines={1}>
                {libro?.autores.join(", ")}
              </Text>
            </View>
          </View>
          <ScrollView style={{ maxHeight: 300 }}>
            {estado === "cargando" ? <ActivityIndicator color={colores.primario} accessibilityLabel="Cargando sinopsis" /> : null}
            {estado === "ok" ? (
              <Text style={estilos.texto}>{texto ?? "Este libro no tiene sinopsis disponible."}</Text>
            ) : null}
            {estado === "error" ? (
              <View style={estilos.error}>
                <Icono nombre="alert-circle" color={colores.error} />
                <Text style={{ color: colores.error, flex: 1 }}>No se pudo cargar la sinopsis.</Text>
              </View>
            ) : null}
          </ScrollView>
          {estado === "error" && libro ? (
            <Boton titulo="Reintentar" icono="refresh" variante="secundario" onPress={() => cargar(libro.id)} />
          ) : null}
          <Boton titulo="Cerrar" accessibilityLabel="Cerrar vista previa" onPress={onCerrar} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: "rgba(17,14,40,0.6)", justifyContent: "center", padding: 20 },
  caja: { backgroundColor: colores.tarjeta, borderRadius: radio.l, padding: 20, gap: 16, width: "100%", maxWidth: 480, alignSelf: "center", ...sombraFuerte },
  cabecera: { flexDirection: "row", gap: 14 },
  etiqueta: { fontSize: 11, fontWeight: "800", color: colores.primario, letterSpacing: 1.2 },
  titulo: { fontSize: 19, fontWeight: "800", color: colores.texto },
  autor: { fontSize: 14, color: colores.suave },
  texto: { fontSize: 15, lineHeight: 23, color: colores.texto },
  error: { flexDirection: "row", gap: 8, alignItems: "center" },
});
