import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Boton } from "@/components/Boton";
import { Calificacion } from "@/components/Calificacion";
import { FiltroEstado } from "@/components/FiltroEstado";
import { Icono } from "@/components/Icono";
import { Portada } from "@/components/Portada";
import { usePortadaInteractiva } from "@/hooks/usePortadaInteractiva";
import { colores, degradado, radio, sombra, sombraFuerte } from "@/theme";
import type { Estado, LibroResumen } from "@/types";

/** Portada con zoom por pellizco (y botones) e inclinación con giroscopio. */
export function HeroPortada({ libro }: { libro: LibroResumen }) {
  const { top } = useSafeAreaInsets();
  const { pellizco, zoom, estilo } = usePortadaInteractiva();
  return (
    <LinearGradient
      colors={degradado}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[estilos.hero, { paddingTop: top + 56 }]}
    >
      <GestureDetector gesture={pellizco}>
        <Animated.View style={[estilos.portada, estilo]}>
          <Portada url={libro.portada_url} titulo={libro.titulo} ancho={170} alto={255} />
        </Animated.View>
      </GestureDetector>
      <View style={estilos.zoom}>
        <Boton
          compacto
          variante="fantasma"
          icono="remove"
          titulo="Alejar"
          accessibilityLabel="Alejar portada"
          onPress={() => zoom(-0.5)}
          style={estilos.botonZoom}
        />
        <Boton
          compacto
          variante="fantasma"
          icono="add"
          titulo="Acercar"
          accessibilityLabel="Acercar portada"
          onPress={() => zoom(0.5)}
          style={estilos.botonZoom}
        />
      </View>
    </LinearGradient>
  );
}

export function EncabezadoLibro({ libro, descripcion }: { libro: LibroResumen; descripcion: string | null }) {
  return (
    <>
      <View style={estilos.tarjeta}>
        <Text style={estilos.titulo} accessibilityRole="header">
          {libro.titulo}
        </Text>
        <Text style={estilos.autor}>{libro.autores.join(", ") || "Autor desconocido"}</Text>
        {libro.anio ? (
          <View style={estilos.meta}>
            <Icono nombre="calendar-outline" tam={14} color={colores.suave} />
            <Text style={estilos.metaTexto}>Publicado en {libro.anio}</Text>
          </View>
        ) : null}
      </View>
      {descripcion ? (
        <View style={[estilos.tarjeta, { gap: 10 }]}>
          <Text style={estilos.etiqueta}>Sinopsis</Text>
          <Text style={estilos.texto}>{descripcion}</Text>
        </View>
      ) : null}
    </>
  );
}

type FormProps = {
  estado: Estado;
  calificacion: number | null;
  nota: string;
  onEstado: (e: Estado | null) => void;
  onCalificacion: (v: number | null) => void;
  onNota: (t: string) => void;
};

/** Estado, calificación (solo si «Leído») y nota. */
export function FormularioLectura({ estado, calificacion, nota, onEstado, onCalificacion, onNota }: FormProps) {
  return (
    <View style={[estilos.tarjeta, { gap: 10 }]}>
      <Text style={estilos.etiqueta}>Estado</Text>
      <FiltroEstado valor={estado} onCambiar={onEstado} />
      <Text style={[estilos.etiqueta, { marginTop: 8 }]}>Calificación</Text>
      {estado === "leido" ? (
        <Calificacion valor={calificacion} onCambiar={onCalificacion} />
      ) : (
        <View style={estilos.info}>
          <Icono nombre="information-circle-outline" tam={18} color={colores.suave} />
          <Text style={estilos.infoTexto}>Podrás calificarlo cuando lo marques como «Leído».</Text>
        </View>
      )}
      <Text style={[estilos.etiqueta, { marginTop: 8 }]}>Nota</Text>
      <TextInput
        style={estilos.nota}
        value={nota}
        onChangeText={onNota}
        multiline
        maxLength={2000}
        placeholder="¿Qué te pareció? ¿Quién te lo recomendó?"
        placeholderTextColor={colores.suave}
        accessibilityLabel="Nota"
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  hero: { alignItems: "center", paddingBottom: 56, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  portada: { zIndex: 1, ...sombraFuerte },
  zoom: { flexDirection: "row", gap: 10, marginTop: 20 },
  botonZoom: { backgroundColor: "rgba(255,255,255,0.92)" },
  tarjeta: { backgroundColor: colores.tarjeta, borderRadius: radio.l, padding: 18, gap: 4, ...sombra },
  titulo: { fontSize: 24, fontWeight: "900", color: colores.texto, letterSpacing: -0.3 },
  autor: { fontSize: 16, color: colores.primario, fontWeight: "700" },
  meta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  metaTexto: { fontSize: 14, color: colores.suave },
  etiqueta: { fontSize: 12, fontWeight: "800", color: colores.suave, letterSpacing: 1, textTransform: "uppercase" },
  texto: { fontSize: 15, lineHeight: 23, color: colores.texto },
  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colores.fondo,
    padding: 12,
    borderRadius: radio.m,
  },
  infoTexto: { flex: 1, fontSize: 14, color: colores.suave },
  nota: {
    minHeight: 100,
    textAlignVertical: "top",
    borderWidth: 1.5,
    borderColor: colores.borde,
    borderRadius: radio.m,
    padding: 12,
    fontSize: 15,
    color: colores.texto,
    backgroundColor: colores.fondo,
  },
});
