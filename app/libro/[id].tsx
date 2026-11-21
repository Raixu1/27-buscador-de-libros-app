import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { sinopsis } from "@/api/endpoints";
import { Boton } from "@/components/Boton";
import { Calificacion } from "@/components/Calificacion";
import { FiltroEstado } from "@/components/FiltroEstado";
import { Portada } from "@/components/Portada";
import { libroDeParams } from "@/navigation";
import { useTilt } from "@/sensors/tilt";
import { vibrarExito } from "@/services/haptics";
import {
  actualizarLibro,
  agregarLibro,
  quitarLibro,
  repositorio,
  sincronizarAhora,
} from "@/services/listaService";
import { colores } from "@/theme";
import type { Estado, Lectura } from "@/types";

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const limitar = (v: number) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, v));

export default function DetalleLibro() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const libro = useMemo(() => libroDeParams(params), [params]);

  const [guardado, setGuardado] = useState<Lectura | null>(null);
  const [estado, setEstado] = useState<Estado>("quiero");
  const [calificacion, setCalificacion] = useState<number | null>(null);
  const [nota, setNota] = useState("");
  const [descripcion, setDescripcion] = useState<string | null | undefined>(undefined);
  const [mensaje, setMensaje] = useState<{ texto: string; error: boolean } | null>(null);

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
    transform: [
      { perspective: 800 },
      { rotateX: `${-rotX.value}deg` },
      { rotateY: `${rotY.value}deg` },
      { scale: escala.value },
    ],
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
      const fila = guardado
        ? await actualizarLibro(repo, libro.id, datos)
        : await agregarLibro(repo, libro, datos);
      setGuardado(fila);
      vibrarExito();
      setMensaje({ texto: guardado ? "Cambios guardados." : "Agregado a tu lista.", error: false });
      sincronizarAhora().catch(() => undefined);
    } catch (e) {
      setMensaje({ texto: e instanceof Error ? e.message : "No se pudo guardar.", error: true });
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
    <ScrollView contentContainerStyle={estilos.contenedor} keyboardShouldPersistTaps="handled">
      <GestureDetector gesture={pellizco}>
        <Animated.View style={[estilos.portada, estiloPortada]}>
          <Portada url={libro.portada_url} titulo={libro.titulo} ancho={180} alto={270} />
        </Animated.View>
      </GestureDetector>
      <View style={estilos.fila}>
        <Boton variante="secundario" titulo="− Alejar" accessibilityLabel="Alejar portada" onPress={() => zoom(-0.5)} />
        <Boton variante="secundario" titulo="+ Acercar" accessibilityLabel="Acercar portada" onPress={() => zoom(0.5)} />
      </View>

      <Text style={estilos.titulo} accessibilityRole="header">
        {libro.titulo}
      </Text>
      <Text style={estilos.suave}>{libro.autores.join(", ") || "Autor desconocido"}</Text>
      {libro.anio ? <Text style={estilos.suave}>{libro.anio}</Text> : null}
      {descripcion ? <Text style={estilos.texto}>{descripcion}</Text> : null}

      <Text style={estilos.etiqueta}>Estado</Text>
      <FiltroEstado valor={estado} onCambiar={cambiarEstado} />

      {estado === "leido" ? (
        <>
          <Text style={estilos.etiqueta}>Calificación</Text>
          <Calificacion valor={calificacion} onCambiar={setCalificacion} />
        </>
      ) : (
        <Text style={estilos.suave}>Podrás calificar el libro cuando lo marques como «Leído».</Text>
      )}

      <Text style={estilos.etiqueta}>Nota</Text>
      <TextInput
        style={[estilos.input, { minHeight: 90, textAlignVertical: "top" }]}
        value={nota}
        onChangeText={setNota}
        multiline
        maxLength={2000}
        placeholder="Tus notas sobre el libro"
        accessibilityLabel="Nota"
      />

      {mensaje ? (
        <Text
          style={{ color: mensaje.error ? colores.error : colores.ok, fontWeight: "600" }}
          accessibilityLiveRegion="polite"
          accessibilityRole={mensaje.error ? "alert" : undefined}
        >
          {mensaje.texto}
        </Text>
      ) : null}
      <Boton titulo={guardado ? "Guardar cambios" : "Agregar a mi lista"} onPress={guardar} />
      {guardado ? <Boton variante="peligro" titulo="Quitar de mi lista" onPress={quitar} /> : null}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { padding: 20, gap: 12, backgroundColor: colores.fondo, alignItems: "stretch" },
  portada: { alignSelf: "center", marginVertical: 12, zIndex: 1 },
  fila: { flexDirection: "row", gap: 12, justifyContent: "center" },
  titulo: { fontSize: 24, fontWeight: "800", color: colores.texto },
  suave: { fontSize: 15, color: colores.suave },
  texto: { fontSize: 15, lineHeight: 22, color: colores.texto },
  etiqueta: { fontSize: 14, fontWeight: "700", color: colores.suave, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 10,
    padding: 12,
    backgroundColor: colores.tarjeta,
    fontSize: 16,
  },
});
