import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ApiError } from "@/api/client";
import { buscarLibros } from "@/api/endpoints";
import { Aviso, useAviso } from "@/components/Aviso";
import { Cabecera } from "@/components/Cabecera";
import { Campo } from "@/components/Campo";
import { Icono } from "@/components/Icono";
import { InicioBusqueda } from "@/components/InicioBusqueda";
import { ListaEstados, type EstadoLista } from "@/components/ListaEstados";
import { TarjetaLibro } from "@/components/TarjetaLibro";
import { VistaPreviaModal } from "@/components/VistaPreviaModal";
import { useDebounced } from "@/hooks/useDebounced";
import { abrirLibro } from "@/navigation";
import { agregarLibro, repositorio, sincronizarAhora } from "@/services/listaService";
import { vibrarExito } from "@/services/haptics";
import { validarBusqueda } from "@/services/validacion";
import { colores, radio, sombra } from "@/theme";
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
  const [aviso, mostrarAviso] = useAviso();
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
      mostrarAviso(`«${libro.titulo}» agregado a Quiero leer`);
      await cargarMapaLista();
      sincronizarAhora().catch(() => undefined);
    } catch (e) {
      mostrarAviso(e instanceof Error ? e.message : "No se pudo agregar.", true);
    }
  };

  const errorTexto = texto.length > 0 ? validarBusqueda(texto) : null;

  return (
    <View style={estilos.pantalla}>
      <Cabecera
        titulo="Descubre"
        subtitulo="Encuentra tu próximo libro"
        derecha={
          <Pressable
            onPress={() => router.push("/escaner")}
            accessibilityRole="button"
            accessibilityLabel="Escanear el código de barras ISBN"
            style={({ pressed }) => [estilos.botonEscaner, pressed && { opacity: 0.8 }]}
          >
            <Icono nombre="barcode-outline" tam={26} color={colores.primario} />
          </Pressable>
        }
      >
        <Campo
          icono="search"
          placeholder="Título o autor"
          value={texto}
          onChangeText={setTexto}
          onLimpiar={() => setTexto("")}
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Buscar libros"
        />
        {errorTexto ? <Text style={estilos.errorTexto}>{errorTexto}</Text> : null}
      </Cabecera>

      {estado === "inicial" ? (
        <InicioBusqueda onIdea={setTexto} />
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
      <Aviso aviso={aviso} />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  botonEscaner: { width: 52, height: 52, borderRadius: radio.m, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", ...sombra },
  errorTexto: { color: "#FFE4E6", fontSize: 13, fontWeight: "600", marginTop: -4 },
});
