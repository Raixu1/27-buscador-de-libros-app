import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { sinopsis } from "@/api/endpoints";
import { Aviso, useAviso } from "@/components/Aviso";
import { Boton } from "@/components/Boton";
import { Calificacion } from "@/components/Calificacion";
import { FiltroEstado } from "@/components/FiltroEstado";
import { Icono } from "@/components/Icono";
import { Portada } from "@/components/Portada";
import { libroDeParams } from "@/navigation";
import { useTilt } from "@/sensors/tilt";
import { vibrarExito } from "@/services/haptics";
import { actualizarLibro, agregarLibro, quitarLibro, repositorio, sincronizarAhora } from "@/services/listaService";
import { ANCHO_MAX, colores, degradado, radio, sombra, sombraFuerte } from "@/theme";
import type { Estado, Lectura } from "@/types";

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const limitar = (v: number) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, v));

export default function DetalleLibro() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const libro = useMemo(() => libroDeParams(params), [params]);

  const [guardado, setGuardado] = useState<Lectura | null>(null);
  const [estado, setEstado] = useState<Estado>("quiero");
  const [calificacion, setCalificacion] = useState<number | null>(null);
  const [nota, setNota] = useState("");
  const [descripcion, setDescripcion] = useState<string | null | undefined>(undefined);
  const [aviso, mostrarAviso] = useAviso();

  // Zoom con pellizco + botones equivalentes; inclinación con giroscopio (portada estática si no hay sensor).
  const escala = useSharedValue(1);
  const base = useSharedValue(1);
  const { rotX, rotY } = useTilt(true);

  useEffect(() => {
    let activo = true;
    (async () => {
      const fila = await (await repositorio()).obtener(libro.id);
      if (!activo || !fila || fila.deleted) return;
      setGuardado(fila);
      setEstado(fila.estado);
      setCalificacion(fila.calificacion);
      setNota(fila.nota ?? "");
    })().catch(() => undefined);
    sinopsis(libro.id)
      .then((r) => activo && setDescripcion(r.descripcion))
      .catch(() => activo && setDescripcion(null));
    return () => {
      activo = false;
    };
  }, [libro.id]);

  const pellizco = Gesture.Pinch()
    .onUpdate((e) => {
      escala.value = limitar(base.value * e.scale);
    })
    .onEnd(() => {
      base.value = escala.value;
    });

  const zoom = (delta: number) => {
    const nuevo = limitar(base.value + delta);
    base.value = nuevo;
    escala.value = withSpring(nuevo);
  };

  const estiloPortada = useAnimatedStyle(() => ({
    transform: [{ perspective: 800 }, { rotateX: `${-rotX.value}deg` }, { rotateY: `${rotY.value}deg` }, { scale: escala.value }],
  }));

  const cambiarEstado = (e: Estado | null) => {
    if (!e) return;
    setEstado(e);
    if (e !== "leido") setCalificacion(null);
  };

  const guardar = async () => {
    try {
      const repo = await repositorio();
      const datos = { estado, calificacion, nota };
      const fila = guardado ? await actualizarLibro(repo, libro.id, datos) : await agregarLibro(repo, libro, datos);
      setGuardado(fila);
      vibrarExito();
      mostrarAviso(guardado ? "Cambios guardados" : "Agregado a tu lista");
      sincronizarAhora().catch(() => undefined);
    } catch (e) {
      mostrarAviso(e instanceof Error ? e.message : "No se pudo guardar.", true);
    }
  };

  const quitar = () =>
    Alert.alert("Quitar de mi lista", `¿Quitar «${libro.titulo}» de tu lista?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Quitar",
        style: "destructive",
        onPress: async () => {
          await quitarLibro(await repositorio(), libro.id);
          sincronizarAhora().catch(() => undefined);
          router.back();
        },
      },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: colores.fondo }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={degradado} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[estilos.hero, { paddingTop: top + 56 }]}>
          <GestureDetector gesture={pellizco}>
            <Animated.View style={[estilos.portada, estiloPortada]}>
              <Portada url={libro.portada_url} titulo={libro.titulo} ancho={170} alto={255} />
            </Animated.View>
          </GestureDetector>
          <View style={estilos.zoom}>
            <Boton compacto variante="fantasma" icono="remove" titulo="Alejar" accessibilityLabel="Alejar portada" onPress={() => zoom(-0.5)} style={estilos.botonZoom} />
            <Boton compacto variante="fantasma" icono="add" titulo="Acercar" accessibilityLabel="Acercar portada" onPress={() => zoom(0.5)} style={estilos.botonZoom} />
          </View>
        </LinearGradient>

        <View style={estilos.cuerpo}>
          <View style={estilos.encabezado}>
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
            <View style={estilos.seccion}>
              <Text style={estilos.etiqueta}>Sinopsis</Text>
              <Text style={estilos.texto}>{descripcion}</Text>
            </View>
          ) : null}

          <View style={estilos.seccion}>
            <Text style={estilos.etiqueta}>Estado</Text>
            <FiltroEstado valor={estado} onCambiar={cambiarEstado} />

            <Text style={[estilos.etiqueta, { marginTop: 8 }]}>Calificación</Text>
            {estado === "leido" ? (
              <Calificacion valor={calificacion} onCambiar={setCalificacion} />
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
              onChangeText={setNota}
              multiline
              maxLength={2000}
              placeholder="¿Qué te pareció? ¿Quién te lo recomendó?"
              placeholderTextColor={colores.suave}
              accessibilityLabel="Nota"
            />
          </View>

          <Boton icono={guardado ? "save-outline" : "add-circle-outline"} titulo={guardado ? "Guardar cambios" : "Agregar a mi lista"} onPress={guardar} />
          {guardado ? <Boton variante="peligro" icono="trash-outline" titulo="Quitar de mi lista" onPress={quitar} /> : null}
        </View>
      </ScrollView>
      <Aviso aviso={aviso} />
    </View>
  );
}

const estilos = StyleSheet.create({
  hero: { alignItems: "center", paddingBottom: 56, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  portada: { zIndex: 1, ...sombraFuerte },
  zoom: { flexDirection: "row", gap: 10, marginTop: 20 },
  botonZoom: { backgroundColor: "rgba(255,255,255,0.92)" },
  cuerpo: { marginTop: -28, paddingHorizontal: 16, gap: 14, width: "100%", maxWidth: ANCHO_MAX, alignSelf: "center" },
  encabezado: { backgroundColor: colores.tarjeta, borderRadius: radio.l, padding: 18, gap: 4, ...sombra },
  titulo: { fontSize: 24, fontWeight: "900", color: colores.texto, letterSpacing: -0.3 },
  autor: { fontSize: 16, color: colores.primario, fontWeight: "700" },
  meta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  metaTexto: { fontSize: 14, color: colores.suave },
  seccion: { backgroundColor: colores.tarjeta, borderRadius: radio.l, padding: 18, gap: 10, ...sombra },
  etiqueta: { fontSize: 12, fontWeight: "800", color: colores.suave, letterSpacing: 1, textTransform: "uppercase" },
  texto: { fontSize: 15, lineHeight: 23, color: colores.texto },
  info: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colores.fondo, padding: 12, borderRadius: radio.m },
  infoTexto: { flex: 1, fontSize: 14, color: colores.suave },
  nota: { minHeight: 100, textAlignVertical: "top", borderWidth: 1.5, borderColor: colores.borde, borderRadius: radio.m, padding: 12, fontSize: 15, color: colores.texto, backgroundColor: colores.fondo },
});
