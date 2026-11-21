import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Boton } from "@/components/Boton";
import { Campo } from "@/components/Campo";
import { Icono } from "@/components/Icono";
import { ActivarCamara, SinCamara, VisorCamara } from "@/components/VisorCamara";
import { useBuscarIsbn } from "@/hooks/useBuscarIsbn";
import { useCamara, type ModoCamara } from "@/hooks/useCamara";
import { ANCHO_MAX, colores, radio } from "@/theme";

function Separador() {
  return (
    <View style={estilos.separador}>
      <View style={estilos.linea} />
      <Text style={estilos.separadorTexto}>o escríbelo</Text>
      <View style={estilos.linea} />
    </View>
  );
}

function MensajeError({ texto }: { texto: string }) {
  return (
    <View style={estilos.error} accessibilityRole="alert">
      <Icono nombre="alert-circle" color={colores.error} />
      <Text style={estilos.errorTexto}>{texto}</Text>
    </View>
  );
}

type ZonaProps = { modo: ModoCamara; onActivar: () => void; onCodigo: (d: string) => void; buscando: boolean };

function ZonaCamara({ modo, onActivar, onCodigo, buscando }: ZonaProps) {
  if (modo === "no-disponible") return <SinCamara />;
  if (modo === "visor") return <VisorCamara onCodigo={onCodigo} buscando={buscando} />;
  return <ActivarCamara onActivar={onActivar} />;
}

/** Escanear ISBN con la cámara, con entrada manual como alternativa. */
export default function Escaner() {
  const [manual, setManual] = useState("");
  const { buscar, buscando, error, setError, ultimoIsbn } = useBuscarIsbn();
  const sinPermiso = useCallback(
    () => setError("Sin permiso de cámara. Puedes escribir el ISBN manualmente."),
    [setError],
  );
  const { modo, activar } = useCamara(sinPermiso);

  return (
    <ScrollView
      style={{ backgroundColor: colores.fondo }}
      contentContainerStyle={estilos.contenedor}
      keyboardShouldPersistTaps="handled"
    >
      <ZonaCamara modo={modo} onActivar={activar} onCodigo={buscar} buscando={buscando} />
      <Separador />
      <Campo
        icono="keypad-outline"
        value={manual}
        onChangeText={setManual}
        onLimpiar={() => setManual("")}
        placeholder="978-0-306-40615-7"
        autoCapitalize="characters"
        accessibilityLabel="ISBN"
        onSubmitEditing={() => buscar(manual)}
      />
      <Boton
        icono="search"
        titulo={buscando ? "Buscando…" : "Buscar ISBN"}
        deshabilitado={buscando}
        onPress={() => buscar(manual)}
        accessibilityLabel="Buscar libro por ISBN escrito"
      />
      {error ? <MensajeError texto={error} /> : null}
      {error && ultimoIsbn ? (
        <Boton titulo="Reintentar" icono="refresh" variante="secundario" onPress={() => buscar(ultimoIsbn)} />
      ) : null}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { padding: 20, gap: 14, width: "100%", maxWidth: ANCHO_MAX, alignSelf: "center" },
  separador: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 4 },
  linea: { flex: 1, height: 1, backgroundColor: colores.borde },
  separadorTexto: { fontSize: 13, color: colores.suave, fontWeight: "600" },
  error: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    backgroundColor: colores.errorSuave,
    padding: 12,
    borderRadius: radio.m,
  },
  errorTexto: { color: colores.error, fontSize: 14, flex: 1, fontWeight: "600" },
});
