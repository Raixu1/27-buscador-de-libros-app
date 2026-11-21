import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icono, type NombreIcono } from "@/components/Icono";
import { ANCHO_MAX, colores, radio, sombra } from "@/theme";

const IDEAS = ["Cien años de soledad", "Harry Potter", "Isabel Allende", "Ciencia ficción"];
const CONSEJOS: { icono: NombreIcono; texto: string }[] = [
  { icono: "arrow-forward-circle-outline", texto: "Desliza una tarjeta a la derecha para agregarla a «Quiero leer»." },
  { icono: "hand-left-outline", texto: "Mantén pulsada una tarjeta para ver la sinopsis." },
  { icono: "barcode-outline", texto: "Escanea el código de barras de un libro para encontrarlo al instante." },
];

/** Contenido del buscador antes de escribir: ideas de búsqueda y consejos de gestos. */
export function InicioBusqueda({ onIdea }: { onIdea: (texto: string) => void }) {
  return (
    <View style={estilos.inicial}>
      <Text style={estilos.seccion}>Ideas para empezar</Text>
      <View style={estilos.ideas}>
        {IDEAS.map((idea) => (
          <Pressable
            key={idea}
            onPress={() => onIdea(idea)}
            accessibilityRole="button"
            accessibilityLabel={`Buscar ${idea}`}
            style={({ pressed }) => [estilos.idea, pressed && { opacity: 0.7 }]}
          >
            <Text style={estilos.ideaTexto}>{idea}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={[estilos.seccion, { marginTop: 8 }]}>Consejos</Text>
      {CONSEJOS.map((c) => (
        <View key={c.texto} style={estilos.consejo}>
          <View style={estilos.consejoIcono}>
            <Icono nombre={c.icono} color={colores.primario} />
          </View>
          <Text style={estilos.consejoTexto}>{c.texto}</Text>
        </View>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  inicial: { padding: 20, gap: 12, width: "100%", maxWidth: ANCHO_MAX, alignSelf: "center" },
  seccion: { fontSize: 13, fontWeight: "800", color: colores.suave, letterSpacing: 1, textTransform: "uppercase" },
  ideas: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  idea: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: radio.pill,
    backgroundColor: colores.tarjeta,
    borderWidth: 1.5,
    borderColor: colores.borde,
  },
  ideaTexto: { color: colores.texto, fontWeight: "600" },
  consejo: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: colores.tarjeta,
    borderRadius: radio.m,
    padding: 14,
    ...sombra,
  },
  consejoIcono: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colores.primarioSuave,
    alignItems: "center",
    justifyContent: "center",
  },
  consejoTexto: { flex: 1, fontSize: 14, color: colores.texto, lineHeight: 20 },
});
