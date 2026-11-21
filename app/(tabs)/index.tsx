import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Aviso, useAviso } from "@/components/Aviso";
import { Cabecera } from "@/components/Cabecera";
import { Campo } from "@/components/Campo";
import { Icono } from "@/components/Icono";
import { InicioBusqueda } from "@/components/InicioBusqueda";
import { ListaEstados } from "@/components/ListaEstados";
import { TarjetaLibro } from "@/components/TarjetaLibro";
import { VistaPreviaModal } from "@/components/VistaPreviaModal";
import { useBusqueda } from "@/hooks/useBusqueda";
import { useDebounced } from "@/hooks/useDebounced";
import { useMapaLista } from "@/hooks/useMapaLista";
import { abrirLibro } from "@/navigation";
import { validarBusqueda } from "@/services/validacion";
import { colores, radio, sombra } from "@/theme";
import type { LibroResumen } from "@/types";

const SUGERENCIAS = ["Revisa la ortografía", "Prueba con el apellido del autor", "Usa menos palabras"];

function BotonEscaner({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Escanear el código de barras ISBN"
      style={({ pressed }) => [estilos.botonEscaner, pressed && { opacity: 0.8 }]}
    >
      <Icono nombre="barcode-outline" tam={26} color={colores.primario} />
    </Pressable>
  );
}

/** Campo con debounce aplicado fuera; muestra el aviso de mínimo 3 caracteres. */
function CampoBusqueda({ texto, onCambiar }: { texto: string; onCambiar: (t: string) => void }) {
  const errorTexto = texto.length > 0 ? validarBusqueda(texto) : null;
  return (
    <>
      <Campo
        icono="search"
        placeholder="Título o autor"
        value={texto}
        onChangeText={onCambiar}
        onLimpiar={() => onCambiar("")}
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Buscar libros"
      />
      {errorTexto ? <Text style={estilos.errorTexto}>{errorTexto}</Text> : null}
    </>
  );
}

export default function Buscador() {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const consulta = useDebounced(texto.trim(), 400);
  const b = useBusqueda(consulta);
  const [aviso, mostrarAviso] = useAviso();
  const { enLista, agregarQuiero } = useMapaLista(mostrarAviso);
  const [previa, setPrevia] = useState<LibroResumen | null>(null);

  return (
    <View style={estilos.pantalla}>
      <Cabecera
        titulo="Descubre"
        subtitulo="Encuentra tu próximo libro"
        derecha={<BotonEscaner onPress={() => router.push("/escaner")} />}
      >
        <CampoBusqueda texto={texto} onCambiar={setTexto} />
      </Cabecera>
      {b.estado === "inicial" ? (
        <InicioBusqueda onIdea={setTexto} />
      ) : (
        <ListaEstados
          estado={b.estado}
          datos={b.resultados}
          keyExtractor={(l) => l.id}
          mensajeError={b.error}
          onReintentar={b.reintentar}
          tituloVacio={`Sin resultados para «${consulta}»`}
          sugerencias={SUGERENCIAS}
          onRefrescar={b.refrescar}
          refrescando={b.refrescando}
          onFinal={b.cargarMas}
          cargandoMas={b.cargandoMas}
          renderItem={({ item }) => (
            <TarjetaLibro
              libro={item}
              enLista={enLista[item.id] ?? null}
              onAbrir={() => abrirLibro(router, item)}
              onAgregarQuiero={() => agregarQuiero(item)}
              onVistaPrevia={() => setPrevia(item)}
            />
          )}
        />
      )}
      <VistaPreviaModal libro={previa} onCerrar={() => setPrevia(null)} />
      <Aviso aviso={aviso} />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  botonEscaner: {
    width: 52,
    height: 52,
    borderRadius: radio.m,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    ...sombra,
  },
  errorTexto: { color: "#FFE4E6", fontSize: 13, fontWeight: "600", marginTop: -4 },
});
