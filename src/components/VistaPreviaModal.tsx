import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Boton } from "@/components/Boton";
import { Icono } from "@/components/Icono";
import { Portada } from "@/components/Portada";
import { useSinopsis } from "@/hooks/useSinopsis";
import { colores, radio, sombraFuerte } from "@/theme";
import type { LibroResumen } from "@/types";

type Props = { libro: LibroResumen | null; onCerrar: () => void };

function Cabecera({ libro }: { libro: LibroResumen }) {
  return (
    <View style={estilos.cabecera}>
      <Portada url={libro.portada_url} titulo={libro.titulo} ancho={60} alto={90} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={estilos.etiqueta}>SINOPSIS</Text>
        <Text style={estilos.titulo} accessibilityRole="header" numberOfLines={3}>
          {libro.titulo}
        </Text>
        <Text style={estilos.autor} numberOfLines={1}>
          {libro.autores.join(", ")}
        </Text>
      </View>
    </View>
  );
}

function Contenido({ estado, texto }: { estado: "cargando" | "ok" | "error"; texto: string | null }) {
  if (estado === "cargando")
    return <ActivityIndicator color={colores.primario} accessibilityLabel="Cargando sinopsis" />;
  if (estado === "ok") return <Text style={estilos.texto}>{texto ?? "Este libro no tiene sinopsis disponible."}</Text>;
  return (
    <View style={estilos.error}>
      <Icono nombre="alert-circle" color={colores.error} />
      <Text style={{ color: colores.error, flex: 1 }}>No se pudo cargar la sinopsis.</Text>
    </View>
  );
}

/** Vista previa de la sinopsis (pulsación larga o botón «Sinopsis»). */
export function VistaPreviaModal({ libro, onCerrar }: Props) {
  const { estado, texto, reintentar } = useSinopsis(libro?.id ?? null);
  return (
    <Modal visible={!!libro} transparent animationType="fade" onRequestClose={onCerrar}>
      <Pressable style={estilos.fondo} onPress={onCerrar} accessibilityLabel="Cerrar vista previa">
        <Pressable style={estilos.caja} accessibilityViewIsModal onPress={() => undefined}>
          {libro ? <Cabecera libro={libro} /> : null}
          <ScrollView style={{ maxHeight: 300 }}>
            <Contenido estado={estado} texto={texto} />
          </ScrollView>
          {estado === "error" ? (
            <Boton titulo="Reintentar" icono="refresh" variante="secundario" onPress={reintentar} />
          ) : null}
          <Boton titulo="Cerrar" accessibilityLabel="Cerrar vista previa" onPress={onCerrar} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: "rgba(17,14,40,0.6)", justifyContent: "center", padding: 20 },
  caja: {
    backgroundColor: colores.tarjeta,
    borderRadius: radio.l,
    padding: 20,
    gap: 16,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    ...sombraFuerte,
  },
  cabecera: { flexDirection: "row", gap: 14 },
  etiqueta: { fontSize: 11, fontWeight: "800", color: colores.primario, letterSpacing: 1.2 },
  titulo: { fontSize: 19, fontWeight: "800", color: colores.texto },
  autor: { fontSize: 14, color: colores.suave },
  texto: { fontSize: 15, lineHeight: 23, color: colores.texto },
  error: { flexDirection: "row", gap: 8, alignItems: "center" },
});
