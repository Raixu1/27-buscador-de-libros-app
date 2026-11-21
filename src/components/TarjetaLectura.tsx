import { Pressable, StyleSheet, Text, View } from "react-native";
import { EstadoBadge } from "@/components/EstadoBadge";
import { Icono } from "@/components/Icono";
import { Portada } from "@/components/Portada";
import { colores, radio, sombra } from "@/theme";
import { etiquetaEstado, type Lectura } from "@/types";

/** Fila de «Mi lista»: portada, estado, calificación y si está pendiente de sincronizar. */
export function TarjetaLectura({ item, onPress }: { item: Lectura; onPress: () => void }) {
  const estrellas = item.calificacion ? `, ${item.calificacion} estrellas` : "";
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.titulo}, ${etiquetaEstado(item.estado)}${estrellas}`}
      style={({ pressed }) => [estilos.tarjeta, pressed && { opacity: 0.9 }]}
    >
      <Portada url={item.portada_url} titulo={item.titulo} ancho={60} alto={90} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={estilos.titulo} numberOfLines={2}>
          {item.titulo}
        </Text>
        <Text style={estilos.autor} numberOfLines={1}>
          {item.autores.join(", ") || "Autor desconocido"}
        </Text>
        <View style={estilos.filaBadges}>
          <EstadoBadge estado={item.estado} />
          {item.calificacion ? (
            <View style={estilos.estrellas}>
              <Icono nombre="star" tam={14} color={colores.estrella} />
              <Text style={estilos.estrellasTexto}>{item.calificacion}</Text>
            </View>
          ) : null}
          {item.pending ? <Icono nombre="cloud-upload-outline" tam={16} color={colores.suave} /> : null}
        </View>
      </View>
      <Icono nombre="chevron-forward" color={colores.borde} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 12,
    backgroundColor: colores.tarjeta,
    borderRadius: radio.l,
    ...sombra,
  },
  titulo: { fontSize: 16, fontWeight: "800", color: colores.texto },
  autor: { fontSize: 14, color: colores.suave },
  filaBadges: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  estrellas: { flexDirection: "row", alignItems: "center", gap: 3 },
  estrellasTexto: { fontSize: 13, fontWeight: "800", color: colores.texto },
});
