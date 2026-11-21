import { Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Portada } from "@/components/Portada";
import { vibrarLigero } from "@/services/haptics";
import { colores, espacio } from "@/theme";
import { etiquetaEstado, type Estado, type LibroResumen } from "@/types";

type Props = {
  libro: LibroResumen;
  /** Estado si el libro ya está en mi lista. */
  enLista?: Estado | null;
  onAbrir: () => void;
  onAgregarQuiero: () => void;
  onVistaPrevia: () => void;
};

const UMBRAL_DESLIZAR = 90;

/**
 * Gestos: deslizar a la derecha = agregar a «Quiero leer»; pulsación larga = vista previa.
 * Cada gesto tiene su botón equivalente (accesibilidad).
 */
export function TarjetaLibro({ libro, enLista, onAbrir, onAgregarQuiero, onVistaPrevia }: Props) {
  const x = useSharedValue(0);

  const agregar = () => {
    vibrarLigero();
    onAgregarQuiero();
  };
  const previa = () => {
    vibrarLigero();
    onVistaPrevia();
  };

  const deslizar = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-12, 12])
    .onUpdate((e) => {
      x.value = Math.max(0, e.translationX);
    })
    .onEnd((e) => {
      if (e.translationX > UMBRAL_DESLIZAR) runOnJS(agregar)();
      x.value = withSpring(0);
    });

  const pulsacionLarga = Gesture.LongPress()
    .minDuration(450)
    .onStart(() => {
      runOnJS(previa)();
    });

  const estilo = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const autores = libro.autores.length ? libro.autores.join(", ") : "Autor desconocido";

  return (
    <GestureDetector gesture={Gesture.Race(deslizar, pulsacionLarga)}>
      <Animated.View style={[estilos.tarjeta, estilo]}>
        <Pressable
          onPress={onAbrir}
          accessibilityRole="button"
          accessibilityLabel={`${libro.titulo}, de ${autores}. Abrir detalle`}
          style={estilos.fila}
        >
          <Portada url={libro.portada_url} titulo={libro.titulo} />
          <View style={estilos.info}>
            <Text style={estilos.titulo} numberOfLines={2}>
              {libro.titulo}
            </Text>
            <Text style={estilos.suave} numberOfLines={1}>
              {autores}
            </Text>
            {libro.anio ? <Text style={estilos.suave}>{libro.anio}</Text> : null}
            {enLista ? <Text style={estilos.etiqueta}>En tu lista: {etiquetaEstado(enLista)}</Text> : null}
          </View>
        </Pressable>
        <View style={estilos.acciones}>
          {!enLista ? (
            <Pressable
              onPress={agregar}
              accessibilityRole="button"
              accessibilityLabel={`Agregar ${libro.titulo} a Quiero leer`}
              style={estilos.accion}
            >
              <Text style={estilos.accionTexto}>+ Quiero leer</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={previa}
            accessibilityRole="button"
            accessibilityLabel={`Ver sinopsis de ${libro.titulo}`}
            style={estilos.accion}
          >
            <Text style={estilos.accionTexto}>Sinopsis</Text>
          </Pressable>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.tarjeta,
    borderRadius: 12,
    padding: espacio.m,
    borderWidth: 1,
    borderColor: colores.borde,
    gap: espacio.s,
  },
  fila: { flexDirection: "row", gap: espacio.m },
  info: { flex: 1, gap: 2 },
  titulo: { fontSize: 16, fontWeight: "700", color: colores.texto },
  suave: { fontSize: 14, color: colores.suave },
  etiqueta: { fontSize: 13, color: colores.ok, fontWeight: "600", marginTop: 4 },
  acciones: { flexDirection: "row", gap: espacio.s, justifyContent: "flex-end" },
  accion: { minHeight: 44, paddingHorizontal: 12, justifyContent: "center" },
  accionTexto: { color: colores.primario, fontWeight: "600", fontSize: 14 },
});
