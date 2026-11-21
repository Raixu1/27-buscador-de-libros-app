import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Aviso, useAviso } from "@/components/Aviso";
import { Boton } from "@/components/Boton";
import { EncabezadoLibro, FormularioLectura, HeroPortada } from "@/components/DetallePartes";
import { useLecturaLibro } from "@/hooks/useLecturaLibro";
import { useSinopsis } from "@/hooks/useSinopsis";
import { libroDeParams } from "@/navigation";
import { ANCHO_MAX, colores } from "@/theme";

export default function DetalleLibro() {
  const params = useLocalSearchParams();
  const libro = useMemo(() => libroDeParams(params), [params]);
  const [aviso, mostrarAviso] = useAviso();
  const l = useLecturaLibro(libro, mostrarAviso);
  const { texto: descripcion } = useSinopsis(libro.id);

  return (
    <View style={{ flex: 1, backgroundColor: colores.fondo }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        <HeroPortada libro={libro} />
        <View style={estilos.cuerpo}>
          <EncabezadoLibro libro={libro} descripcion={descripcion} />
          <FormularioLectura
            estado={l.estado}
            calificacion={l.calificacion}
            nota={l.nota}
            onEstado={l.cambiarEstado}
            onCalificacion={l.setCalificacion}
            onNota={l.setNota}
          />
          <Boton
            icono={l.guardado ? "save-outline" : "add-circle-outline"}
            titulo={l.guardado ? "Guardar cambios" : "Agregar a mi lista"}
            onPress={l.guardar}
          />
          {l.guardado ? (
            <Boton variante="peligro" icono="trash-outline" titulo="Quitar de mi lista" onPress={l.quitar} />
          ) : null}
        </View>
      </ScrollView>
      <Aviso aviso={aviso} />
    </View>
  );
}

const estilos = StyleSheet.create({
  cuerpo: { marginTop: -28, paddingHorizontal: 16, gap: 14, width: "100%", maxWidth: ANCHO_MAX, alignSelf: "center" },
});
