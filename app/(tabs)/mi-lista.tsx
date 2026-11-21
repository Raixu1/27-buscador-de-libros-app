import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Cabecera } from "@/components/Cabecera";
import { Campo } from "@/components/Campo";
import { FiltroEstado } from "@/components/FiltroEstado";
import { Icono } from "@/components/Icono";
import { ListaEstados } from "@/components/ListaEstados";
import { ResumenAnual } from "@/components/ResumenAnual";
import { TarjetaLectura } from "@/components/TarjetaLectura";
import { useDebounced } from "@/hooks/useDebounced";
import { useMiLista } from "@/hooks/useMiLista";
import { abrirLibro } from "@/navigation";
import { useShake } from "@/sensors/shake";
import { vibrarExito } from "@/services/haptics";
import { libroAleatorio } from "@/services/listaService";
import { useSesion } from "@/session/SessionProvider";
import { ANCHO_MAX, colores, espacio } from "@/theme";
import type { Estado, Lectura } from "@/types";

function BotonSalir() {
  const { cerrarSesion, email } = useSesion();
  const salir = () =>
    Alert.alert(
      "Cerrar sesión",
      `¿Salir de ${email ?? "tu cuenta"}? Tu lista se borrará de este teléfono, pero sigue guardada en la nube.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Cerrar sesión", style: "destructive", onPress: () => cerrarSesion() },
      ],
    );
  return (
    <Pressable
      onPress={salir}
      accessibilityRole="button"
      accessibilityLabel="Cerrar sesión"
      style={estilos.botonRedondo}
      hitSlop={8}
    >
      <Icono nombre="log-out-outline" tam={22} color="#FFFFFF" />
    </Pressable>
  );
}

function PistaSacudir({ disponible }: { disponible: boolean }) {
  return (
    <Text style={estilos.pista}>
      {disponible
        ? "Sacude el teléfono para elegir un libro al azar."
        : "Sacudir no está disponible: usa «Sorpréndeme»."}
    </Text>
  );
}

export default function MiLista() {
  const router = useRouter();
  const [filtro, setFiltro] = useState<Estado | null>(null);
  const [texto, setTexto] = useState("");
  const consulta = useDebounced(texto, 300);
  const filtros = useMemo(() => ({ filtro, consulta }), [filtro, consulta]);
  const l = useMiLista(filtros);
  const sorpresa = useCallback(() => {
    const libro = libroAleatorio(l.items);
    if (!libro) return;
    vibrarExito();
    abrirLibro(router, libro);
  }, [l.items, router]);
  const { disponible } = useShake(sorpresa, l.enfocado);

  return (
    <View style={estilos.pantalla}>
      <Cabecera
        titulo="Mi lista"
        subtitulo={l.sinConexion ? "Sin conexión · lista guardada en el teléfono" : "Tu biblioteca personal"}
        derecha={<BotonSalir />}
      >
        <ResumenAnual
          leidos={l.leidos}
          anio={new Date().getFullYear()}
          onSorpresa={sorpresa}
          hayLibros={l.items.length > 0}
        />
      </Cabecera>
      <View style={estilos.controles}>
        <Campo
          icono="search"
          placeholder="Buscar en mi lista"
          value={texto}
          onChangeText={setTexto}
          onLimpiar={() => setTexto("")}
          accessibilityLabel="Buscar en mi lista"
        />
        <FiltroEstado valor={filtro} onCambiar={setFiltro} incluirTodos />
        <PistaSacudir disponible={disponible} />
      </View>
      <ListaLecturas l={l} filtrando={!!filtro || !!consulta} onAbrir={(item) => abrirLibro(router, item)} />
    </View>
  );
}

type ListaProps = { l: ReturnType<typeof useMiLista>; filtrando: boolean; onAbrir: (item: Lectura) => void };

function ListaLecturas({ l, filtrando, onAbrir }: ListaProps) {
  return (
    <ListaEstados
      estado={l.estado}
      datos={l.items}
      keyExtractor={(i) => i.id}
      mensajeError="No se pudo leer tu lista."
      onReintentar={l.cargar}
      iconoVacio={filtrando ? "filter-outline" : "library-outline"}
      tituloVacio={filtrando ? "Ningún libro coincide con el filtro" : "Tu lista está vacía"}
      sugerencias={filtrando ? SUGERENCIAS_FILTRO : SUGERENCIAS_VACIA}
      onRefrescar={l.refrescar}
      refrescando={l.refrescando}
      renderItem={({ item }) => <TarjetaLectura item={item} onPress={() => onAbrir(item)} />}
    />
  );
}

const SUGERENCIAS_FILTRO = ["Quita el filtro de estado", "Borra el texto de búsqueda"];
const SUGERENCIAS_VACIA = ["Busca un libro y agrégalo a «Quiero leer»"];

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  botonRedondo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  controles: {
    paddingHorizontal: espacio.l,
    paddingTop: espacio.l,
    gap: 10,
    width: "100%",
    maxWidth: ANCHO_MAX,
    alignSelf: "center",
  },
  pista: { fontSize: 13, color: colores.suave },
});
