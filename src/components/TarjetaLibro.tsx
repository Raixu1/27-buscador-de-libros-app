import { Pressable, StyleSheet, Text, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { EstadoBadge } from "@/components/EstadoBadge";
import { Icono } from "@/components/Icono";
import { Portada } from "@/components/Portada";
import { useDeslizarParaAgregar } from "@/hooks/useDeslizarParaAgregar";
import { vibrarLigero } from "@/services/haptics";
import { colores, espacio, radio, sombra } from "@/theme";
import type { Estado, LibroResumen } from "@/types";

type Props = {
  libro: LibroResumen;
  /** Estado si el libro ya está en mi lista. */
  enLista?: Estado | null;
  onAbrir: () => void;
  onAgregarQuiero: () => void;
  onVistaPrevia: () => void;
};

type AccionesProps = { titulo: string; enLista: boolean; onPrevia: () => void; onAgregar: () => void };

/** Botones equivalentes a los gestos (accesibilidad). */
function Acciones({ titulo, enLista, onPrevia, onAgregar }: AccionesProps) {
  return (
    <View style={estilos.acciones}>
      <Pressable
        onPress={onPrevia}
        accessibilityRole="button"
        accessibilityLabel={`Ver sinopsis de ${titulo}`}
        style={estilos.accion}
      >
        <Icono nombre="eye-outline" tam={16} color={colores.suave} />
        <Text style={[estilos.accionTexto, { color: colores.suave }]}>Sinopsis</Text>
      </Pressable>
      {!enLista ? (
        <Pressable
          onPress={onAgregar}
          accessibilityRole="button"
          accessibilityLabel={`Agregar ${titulo} a Quiero leer`}
          style={[estilos.accion, estilos.accionPrincipal]}
        >
          <Icono nombre="add" tam={16} color={colores.primario} />
          <Text style={estilos.accionTexto}>Quiero leer</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function InfoLibro({ libro, autores, enLista }: { libro: LibroResumen; autores: string; enLista?: Estado | null }) {
  return (
    <View style={estilos.info}>
      <Text style={estilos.titulo} numberOfLines={2}>
        {libro.titulo}
      </Text>
      <Text style={estilos.autor} numberOfLines={1}>
        {autores}
      </Text>
      {libro.anio ? (
        <View style={estilos.meta}>
          <Icono nombre="calendar-outline" tam={13} color={colores.suave} />
          <Text style={estilos.metaTexto}>{libro.anio}</Text>
        </View>
      ) : null}
      {enLista ? <EstadoBadge estado={enLista} /> : null}
    </View>
  );
}

/** Tarjeta de resultado: deslizar a la derecha agrega a «Quiero leer»; pulsación larga muestra la sinopsis. */
export function TarjetaLibro({ libro, enLista, onAbrir, onAgregarQuiero, onVistaPrevia }: Props) {
  const agregar = () => {
    vibrarLigero();
    onAgregarQuiero();
  };
  const previa = () => {
    vibrarLigero();
    onVistaPrevia();
  };
  const { gesto, estiloTarjeta, estiloFondo } = useDeslizarParaAgregar(!enLista, agregar, previa);
  const autores = libro.autores.length ? libro.autores.join(", ") : "Autor desconocido";

  return (
    <View>
      <Animated.View style={[estilos.fondoDeslizar, estiloFondo]} pointerEvents="none">
        <Icono nombre="bookmark" color="#FFFFFF" tam={22} />
        <Text style={estilos.fondoTexto}>Quiero leer</Text>
      </Animated.View>
      <GestureDetector gesture={gesto}>
        <Animated.View style={[estilos.tarjeta, estiloTarjeta]}>
          <Pressable
            onPress={onAbrir}
            accessibilityRole="button"
            accessibilityLabel={`${libro.titulo}, de ${autores}. Abrir detalle`}
            style={estilos.fila}
          >
            <Portada url={libro.portada_url} titulo={libro.titulo} ancho={72} alto={108} />
            <InfoLibro libro={libro} autores={autores} enLista={enLista} />
          </Pressable>
          <Acciones titulo={libro.titulo} enLista={!!enLista} onPrevia={previa} onAgregar={agregar} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const estilos = StyleSheet.create({
  fondoDeslizar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colores.ok,
    borderRadius: radio.l,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: espacio.xl,
    gap: 8,
  },
  fondoTexto: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 },
  tarjeta: { backgroundColor: colores.tarjeta, borderRadius: radio.l, padding: espacio.m, gap: espacio.s, ...sombra },
  fila: { flexDirection: "row", gap: espacio.m },
  info: { flex: 1, gap: 4, paddingTop: 2 },
  titulo: { fontSize: 17, fontWeight: "800", color: colores.texto, lineHeight: 22 },
  autor: { fontSize: 14, color: colores.suave, fontWeight: "500" },
  meta: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 },
  metaTexto: { fontSize: 13, color: colores.suave },
  acciones: {
    flexDirection: "row",
    gap: espacio.s,
    justifyContent: "flex-end",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colores.borde,
    paddingTop: espacio.s,
  },
  accion: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: radio.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  accionPrincipal: { backgroundColor: colores.primarioSuave },
  accionTexto: { color: colores.primario, fontWeight: "700", fontSize: 14 },
});
