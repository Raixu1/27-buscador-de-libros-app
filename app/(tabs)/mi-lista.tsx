import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Boton } from "@/components/Boton";
import { FiltroEstado } from "@/components/FiltroEstado";
import { ListaEstados, type EstadoLista } from "@/components/ListaEstados";
import { Portada } from "@/components/Portada";
import { useDebounced } from "@/hooks/useDebounced";
import { abrirLibro } from "@/navigation";
import { useShake } from "@/sensors/shake";
import { libroAleatorio, repositorio, sincronizarAhora } from "@/services/listaService";
import { vibrarExito } from "@/services/haptics";
import { colores } from "@/theme";
import { etiquetaEstado, type Estado, type Lectura } from "@/types";

export default function MiLista() {
  const router = useRouter();
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

  return (
    <View style={estilos.pantalla}>
      <View style={estilos.cabecera}>
        <View style={estilos.estadistica} accessible accessibilityLabel={`Libros leídos este año: ${leidos}`}>
          <Text style={estilos.numero}>{leidos}</Text>
          <Text style={estilos.suave}>leídos en {new Date().getFullYear()}</Text>
        </View>
        <TextInput
          style={estilos.input}
          placeholder="Buscar en mi lista"
          value={texto}
          onChangeText={setTexto}
          accessibilityLabel="Buscar en mi lista"
        />
        <FiltroEstado valor={filtro} onCambiar={setFiltro} incluirTodos />
        <Boton
          variante="secundario"
          titulo="🎲 Libro aleatorio"
          accessibilityLabel="Elegir un libro aleatorio de mi lista"
          onPress={sorpresa}
          deshabilitado={items.length === 0}
        />
        <Text style={estilos.suave}>
          {disponible ? "También puedes sacudir el teléfono." : "Sacudir no está disponible en este dispositivo."}
        </Text>
        {sinConexion ? (
          <Text style={estilos.aviso} accessibilityLiveRegion="polite">
            Sin conexión: mostrando tu lista guardada en el teléfono.
          </Text>
        ) : null}
      </View>

      <ListaEstados
        estado={estado}
        datos={items}
        keyExtractor={(l) => l.id}
        mensajeError={error}
        onReintentar={cargar}
        tituloVacio={filtro || consulta ? "Ningún libro coincide con el filtro" : "Tu lista está vacía"}
        sugerencias={filtro || consulta ? ["Quita el filtro de estado", "Borra el texto de búsqueda"] : ["Busca un libro y agrégalo a «Quiero leer»"]}
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
            style={estilos.tarjeta}
          >
            <Portada url={item.portada_url} titulo={item.titulo} ancho={56} alto={84} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={estilos.titulo} numberOfLines={2}>
                {item.titulo}
              </Text>
              <Text style={estilos.suave} numberOfLines={1}>
                {item.autores.join(", ") || "Autor desconocido"}
              </Text>
              <Text style={estilos.estado}>
                {etiquetaEstado(item.estado)}
                {item.calificacion ? `  ${"★".repeat(item.calificacion)}` : ""}
                {item.pending ? "  · pendiente de sincronizar" : ""}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  cabecera: { padding: 16, gap: 8 },
  estadistica: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  numero: { fontSize: 36, fontWeight: "800", color: colores.primario },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: colores.tarjeta,
    fontSize: 16,
  },
  suave: { fontSize: 14, color: colores.suave },
  aviso: { fontSize: 14, color: colores.error, fontWeight: "600" },
  tarjeta: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    backgroundColor: colores.tarjeta,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  titulo: { fontSize: 16, fontWeight: "700", color: colores.texto },
  estado: { fontSize: 14, color: colores.ok, fontWeight: "600", marginTop: 4 },
});
