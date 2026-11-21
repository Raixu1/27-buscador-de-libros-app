import { StyleSheet, Text, View } from "react-native";
import { Boton } from "@/components/Boton";
import { Icono } from "@/components/Icono";
import { colores, radio, sombra } from "@/theme";

type Props = { leidos: number; anio: number; onSorpresa: () => void; hayLibros: boolean };

/** RF-06: libros leídos este año, y el botón equivalente a sacudir el teléfono. */
export function ResumenAnual({ leidos, anio, onSorpresa, hayLibros }: Props) {
  return (
    <View style={estilos.caja} accessible accessibilityLabel={`Libros leídos en ${anio}: ${leidos}`}>
      <View style={estilos.icono}>
        <Icono nombre="trophy" tam={24} color={colores.acento} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={estilos.numero}>{leidos}</Text>
        <Text style={estilos.texto}>
          {leidos === 1 ? "libro leído" : "libros leídos"} en {anio}
        </Text>
      </View>
      <Boton
        compacto
        variante="secundario"
        icono="shuffle"
        titulo="Sorpréndeme"
        accessibilityLabel="Elegir un libro aleatorio de mi lista"
        onPress={onSorpresa}
        deshabilitado={!hayLibros}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: radio.l,
    padding: 14,
    ...sombra,
  },
  icono: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  numero: { fontSize: 28, fontWeight: "900", color: colores.texto, lineHeight: 32 },
  texto: { fontSize: 13, color: colores.suave, fontWeight: "600" },
});
