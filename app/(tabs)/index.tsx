import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { ApiError } from "@/api/client";
import { buscarLibros } from "@/api/endpoints";
import { Boton } from "@/components/Boton";
import { ListaEstados, type EstadoLista } from "@/components/ListaEstados";
import { TarjetaLibro } from "@/components/TarjetaLibro";
import { VistaPreviaModal } from "@/components/VistaPreviaModal";
import { useDebounced } from "@/hooks/useDebounced";
import { abrirLibro } from "@/navigation";
import { agregarLibro, repositorio, sincronizarAhora } from "@/services/listaService";
import { vibrarExito } from "@/services/haptics";
import { validarBusqueda } from "@/services/validacion";
import { colores } from "@/theme";
import type { Estado, LibroResumen } from "@/types";

const SUGERENCIAS = ["Revisa la ortografía", "Prueba con el apellido del autor", "Usa menos palabras"];

export default function Buscador() {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const consulta = useDebounced(texto.trim(), 400);
  const [resultados, setResultados] = useState<LibroResumen[]>([]);
  const [pagina, setPagina] = useState(1);
  const [hayMas, setHayMas] = useState(false);
  const [estado, setEstado] = useState<EstadoLista | "inicial">("inicial");
  const [error, setError] = useState<string | undefined>();
  const [refrescando, setRefrescando] = useState(false);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [enLista, setEnLista] = useState<Record<string, Estado>>({});
  const [aviso, setAviso] = useState<string | null>(null);
  const [previa, setPrevia] = useState<LibroResumen | null>(null);
  const solicitud = useRef(0);

  const cargarMapaLista = useCallback(async () => {
    const items = await (await repositorio()).listar();
    setEnLista(Object.fromEntries(items.map((i) => [i.id, i.estado])));
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarMapaLista().catch(() => undefined);
    }, [cargarMapaLista]),
  );

  const buscar = useCallback(async (q: string, pag: number, modo: "nueva" | "mas" | "refrescar") => {
    const id = ++solicitud.current;
    if (modo === "nueva") setEstado("cargando");
    if (modo === "mas") setCargandoMas(true);
    if (modo === "refrescar") setRefrescando(true);
    try {
      const r = await buscarLibros(q, pag);
      if (id !== solicitud.current) return; // llegó una respuesta vieja
      setResultados((prev) => (modo === "mas" ? [...prev, ...r.resultados] : r.resultados));
      setPagina(pag);
      setHayMas(r.hay_mas);
      setEstado(r.resultados.length === 0 && modo !== "mas" ? "vacio" : "ok");
    } catch (e) {
      if (id !== solicitud.current) return;
      if (modo === "mas") setHayMas(false);
      else {
        setError(e instanceof ApiError ? e.message : "No se pudo buscar.");
        setEstado("error");
      }
    } finally {
      if (id === solicitud.current) {
        setCargandoMas(false);
        setRefrescando(false);
      }
    }
  }, []);

  useEffect(() => {
    if (validarBusqueda(consulta)) {
      solicitud.current++;
      setResultados([]);
      setEstado("inicial");
      return;
    }
    buscar(consulta, 1, "nueva");
  }, [consulta, buscar]);

  const agregarRapido = async (libro: LibroResumen) => {
    try {
      const repo = await repositorio();
      await agregarLibro(repo, libro, { estado: "quiero", calificacion: null, nota: null });
      vibrarExito();
      setAviso(`«${libro.titulo}» agregado a Quiero leer.`);
      await cargarMapaLista();
      sincronizarAhora().catch(() => undefined);
    } catch (e) {
      setAviso(e instanceof Error ? e.message : "No se pudo agregar.");
    }
  };

  const errorTexto = texto.length > 0 ? validarBusqueda(texto) : null;

  return (
    <View style={estilos.pantalla}>
      <View style={estilos.cabecera}>
        <TextInput
          style={estilos.input}
          placeholder="Busca por título o autor"
          value={texto}
          onChangeText={setTexto}
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Buscar libros"
        />
        {errorTexto ? <Text style={estilos.error}>{errorTexto}</Text> : null}
        <Boton
          variante="secundario"
          titulo="📷 Escanear ISBN"
          accessibilityLabel="Escanear el código de barras ISBN"
          onPress={() => router.push("/escaner")}
        />
        {aviso ? (
          <Text style={estilos.aviso} accessibilityLiveRegion="polite">
            {aviso}
          </Text>
        ) : null}
      </View>

      {estado === "inicial" ? (
        <View style={estilos.inicial}>
          <Text style={estilos.suave}>Escribe al menos 3 caracteres o escanea el ISBN de un libro.</Text>
          <Text style={estilos.suave}>Desliza una tarjeta a la derecha para agregarla a «Quiero leer».</Text>
        </View>
      ) : (
        <ListaEstados
          estado={estado}
          datos={resultados}
          keyExtractor={(l) => l.id}
          mensajeError={error}
          onReintentar={() => buscar(consulta, 1, "nueva")}
          tituloVacio={`Sin resultados para «${consulta}»`}
          sugerencias={SUGERENCIAS}
          onRefrescar={() => buscar(consulta, 1, "refrescar")}
          refrescando={refrescando}
          onFinal={() => hayMas && !cargandoMas && buscar(consulta, pagina + 1, "mas")}
          cargandoMas={cargandoMas}
          renderItem={({ item }) => (
            <TarjetaLibro
              libro={item}
              enLista={enLista[item.id] ?? null}
              onAbrir={() => abrirLibro(router, item)}
              onAgregarQuiero={() => agregarRapido(item)}
              onVistaPrevia={() => setPrevia(item)}
            />
          )}
        />
      )}
      <VistaPreviaModal libro={previa} onCerrar={() => setPrevia(null)} />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  cabecera: { padding: 16, gap: 8 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: colores.tarjeta,
    fontSize: 16,
  },
  error: { color: colores.error, fontSize: 14 },
  aviso: { color: colores.ok, fontSize: 14, fontWeight: "600" },
  inicial: { padding: 24, gap: 8 },
  suave: { fontSize: 15, color: colores.suave },
});
