import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Boton } from "@/components/Boton";
import { Cabecera } from "@/components/Cabecera";
import { Campo } from "@/components/Campo";
import { EstadoBadge } from "@/components/EstadoBadge";
import { FiltroEstado } from "@/components/FiltroEstado";
import { Icono } from "@/components/Icono";
import { ListaEstados, type EstadoLista } from "@/components/ListaEstados";
import { Portada } from "@/components/Portada";
import { useDebounced } from "@/hooks/useDebounced";
import { abrirLibro } from "@/navigation";
import { useShake } from "@/sensors/shake";
import { useSesion } from "@/session/SessionProvider";
import { libroAleatorio, repositorio, sincronizarAhora } from "@/services/listaService";
import { vibrarExito } from "@/services/haptics";
import { ANCHO_MAX, colores, espacio, radio, sombra } from "@/theme";
import { etiquetaEstado, type Estado, type Lectura } from "@/types";

export default function MiLista() {
  const router = useRouter();
  const { cerrarSesion, email } = useSesion();
  const [filtro, setFiltro] = useState<Estado | null>(null);
  const [texto, setTexto] = useState("");
  const consulta = useDebounced(texto, 300);
  const [items, setItems] = useState<Lectura[]>([]);
  const [estado, setEstado] = useState<EstadoLista>("cargando");
  const [error, setError] = useState<string | undefined>();
  const [leidos, setLeidos] = useState(0);
  const [refrescando, setRefrescando] = useState(false);
  const [enfocado, setEnfocado] = useState(false);
  const [sinConexion, setSinConexion] = useState(false);
  const filtroRef = useRef<{ filtro: Estado | null; consulta: string }>({ filtro: null, consulta: "" });

  const cargar = useCallback(async () => {
    try {
      const repo = await repositorio();
      const { filtro: f, consulta: c } = filtroRef.current;
      const lista = await repo.listar({ estado: f, texto: c });
      setItems(lista);
      setLeidos(await repo.contarLeidosDelAnio(new Date().getFullYear()));
      setEstado(lista.length === 0 ? "vacio" : "ok");
    } catch {
      setError("No se pudo leer tu lista.");
      setEstado("error");
    }
  }, []);

  const sincronizar = useCallback(async () => {
    const r = await sincronizarAhora();
    setSinConexion(r === null);
    await cargar();
  }, [cargar]);

  useFocusEffect(
    useCallback(() => {
      setEnfocado(true);
      cargar().then(sincronizar);
      return () => setEnfocado(false);
    }, [cargar, sincronizar]),
  );

  // Recarga desde SQLite al cambiar el filtro de estado o el texto (RF-05).
  useEffect(() => {
    filtroRef.current = { filtro, consulta };
    cargar();
  }, [filtro, consulta, cargar]);

  const sorpresa = useCallback(() => {
    const libro = libroAleatorio(items);
    if (!libro) return;
    vibrarExito();
    abrirLibro(router, libro);
  }, [items, router]);

  const { disponible } = useShake(sorpresa, enfocado);

  const salir = () =>
    Alert.alert("Cerrar sesión", `¿Salir de ${email ?? "tu cuenta"}? Tu lista se borrará de este teléfono, pero sigue guardada en la nube.`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: () => cerrarSesion() },
    ]);

  const anio = new Date().getFullYear();
  const filtrando = !!filtro || !!consulta;

  return (
    <View style={estilos.pantalla}>
      <Cabecera
        titulo="Mi lista"
        subtitulo={sinConexion ? "Sin conexión · lista guardada en el teléfono" : "Tu biblioteca personal"}
        derecha={
          <Pressable onPress={salir} accessibilityRole="button" accessibilityLabel="Cerrar sesión" style={estilos.botonRedondo} hitSlop={8}>
            <Icono nombre="log-out-outline" tam={22} color="#FFFFFF" />
          </Pressable>
        }
      >
        <View style={estilos.estadistica} accessible accessibilityLabel={`Libros leídos en ${anio}: ${leidos}`}>
          <View style={estilos.estadisticaIcono}>
            <Icono nombre="trophy" tam={24} color={colores.acento} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={estilos.numero}>{leidos}</Text>
            <Text style={estilos.numeroTexto}>{leidos === 1 ? "libro leído" : "libros leídos"} en {anio}</Text>
          </View>
          <Boton
            compacto
            variante="secundario"
            icono="shuffle"
            titulo="Sorpréndeme"
            accessibilityLabel="Elegir un libro aleatorio de mi lista"
            onPress={sorpresa}
            deshabilitado={items.length === 0}
          />
        </View>
      </Cabecera>

      <View style={estilos.controles}>
        <Campo icono="search" placeholder="Buscar en mi lista" value={texto} onChangeText={setTexto} onLimpiar={() => setTexto("")} accessibilityLabel="Buscar en mi lista" />
        <FiltroEstado valor={filtro} onCambiar={setFiltro} incluirTodos />
        <Text style={estilos.pista}>
          <Icono nombre={disponible ? "phone-portrait-outline" : "information-circle-outline"} tam={13} color={colores.suave} />{" "}
          {disponible ? "Sacude el teléfono para elegir un libro al azar." : "Sacudir no está disponible: usa «Sorpréndeme»."}
        </Text>
      </View>

      <ListaEstados
        estado={estado}
        datos={items}
        keyExtractor={(l) => l.id}
        mensajeError={error}
        onReintentar={cargar}
        iconoVacio={filtrando ? "filter-outline" : "library-outline"}
        tituloVacio={filtrando ? "Ningún libro coincide con el filtro" : "Tu lista está vacía"}
        sugerencias={filtrando ? ["Quita el filtro de estado", "Borra el texto de búsqueda"] : ["Busca un libro y agrégalo a «Quiero leer»"]}
        onRefrescar={async () => {
          setRefrescando(true);
          await sincronizar();
          setRefrescando(false);
        }}
        refrescando={refrescando}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => abrirLibro(router, item)}
            accessibilityRole="button"
            accessibilityLabel={`${item.titulo}, ${etiquetaEstado(item.estado)}${item.calificacion ? `, ${item.calificacion} estrellas` : ""}`}
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
        )}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  botonRedondo: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.16)", alignItems: "center", justifyContent: "center" },
  estadistica: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFFFFF", borderRadius: radio.l, padding: 14, ...sombra },
  estadisticaIcono: { width: 48, height: 48, borderRadius: 14, backgroundColor: "#FEF3C7", alignItems: "center", justifyContent: "center" },
  numero: { fontSize: 28, fontWeight: "900", color: colores.texto, lineHeight: 32 },
  numeroTexto: { fontSize: 13, color: colores.suave, fontWeight: "600" },
  controles: { paddingHorizontal: espacio.l, paddingTop: espacio.l, gap: 10, width: "100%", maxWidth: ANCHO_MAX, alignSelf: "center" },
  pista: { fontSize: 13, color: colores.suave },
  tarjeta: { flexDirection: "row", alignItems: "center", gap: 14, padding: 12, backgroundColor: colores.tarjeta, borderRadius: radio.l, ...sombra },
  titulo: { fontSize: 16, fontWeight: "800", color: colores.texto },
  autor: { fontSize: 14, color: colores.suave },
  filaBadges: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  estrellas: { flexDirection: "row", alignItems: "center", gap: 3 },
  estrellasTexto: { fontSize: 13, fontWeight: "800", color: colores.texto },
});
