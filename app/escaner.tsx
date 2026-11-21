import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { ApiError } from "@/api/client";
import { libroPorIsbn } from "@/api/endpoints";
import { Boton } from "@/components/Boton";
import { Campo } from "@/components/Campo";
import { Icono } from "@/components/Icono";
import { abrirLibro } from "@/navigation";
import { vibrarExito } from "@/services/haptics";
import { normalizarIsbn } from "@/services/isbn";
import { ANCHO_MAX, colores, radio, sombra } from "@/theme";

function Esquinas() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={estilos.marco}>
        {(["tl", "tr", "bl", "br"] as const).map((e) => (
          <View key={e} style={[estilos.esquina, estilos[e]]} />
        ))}
      </View>
      <Text style={estilos.guia}>Centra el código de barras del libro</Text>
    </View>
  );
}

export default function Escaner() {
  const router = useRouter();
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [camaraDisponible, setCamaraDisponible] = useState<boolean | null>(null);
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [manual, setManual] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ultimoIsbn = useRef<string | null>(null);
  const bloqueado = useRef(false);

  useEffect(() => {
    CameraView.isAvailableAsync()
      .then(setCamaraDisponible)
      .catch(() => setCamaraDisponible(false));
  }, []);

  const buscar = async (entrada: string) => {
    const isbn = normalizarIsbn(entrada);
    if (!isbn) {
      setError("Ese ISBN no es válido. Revisa los dígitos.");
      bloqueado.current = false;
      return;
    }
    ultimoIsbn.current = isbn;
    setError(null);
    setBuscando(true);
    try {
      const libro = await libroPorIsbn(isbn);
      vibrarExito();
      abrirLibro(router, libro, true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo buscar el libro.");
    } finally {
      setBuscando(false);
      bloqueado.current = false;
    }
  };

  const activarCamara = async () => {
    const r = permiso?.granted ? permiso : await pedirPermiso();
    setCamaraActiva(!!r?.granted);
    if (!r?.granted) setError("Sin permiso de cámara. Puedes escribir el ISBN manualmente.");
  };

  return (
    <ScrollView style={{ backgroundColor: colores.fondo }} contentContainerStyle={estilos.contenedor} keyboardShouldPersistTaps="handled">
      {camaraDisponible === false ? (
        <View style={estilos.tarjeta}>
          <Icono nombre="camera-reverse-outline" tam={32} color={colores.suave} />
          <Text style={estilos.texto}>La cámara no está disponible en este dispositivo. Escribe el ISBN abajo.</Text>
        </View>
      ) : camaraActiva && permiso?.granted ? (
        <View style={estilos.camara} accessible accessibilityLabel="Cámara para escanear el código de barras">
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["ean13"] }}
            onBarcodeScanned={({ data }) => {
              if (bloqueado.current) return;
              bloqueado.current = true;
              buscar(data);
            }}
          />
          <Esquinas />
          {buscando ? (
            <View style={estilos.cargando}>
              <ActivityIndicator color="#FFFFFF" size="large" />
            </View>
          ) : null}
        </View>
      ) : (
        <View style={estilos.tarjeta}>
          <View style={estilos.iconoGrande}>
            <Icono nombre="barcode-outline" tam={44} color={colores.primario} />
          </View>
          <Text style={estilos.tituloTarjeta}>Escanea el ISBN</Text>
          <Text style={estilos.texto}>Usaremos la cámara solo para leer el código de barras del libro. No se guardan fotos.</Text>
          <Boton icono="camera-outline" titulo="Activar cámara" onPress={activarCamara} accessibilityLabel="Activar la cámara para escanear" style={{ alignSelf: "stretch" }} />
        </View>
      )}

      <View style={estilos.separador}>
        <View style={estilos.linea} />
        <Text style={estilos.separadorTexto}>o escríbelo</Text>
        <View style={estilos.linea} />
      </View>

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
      <Boton icono="search" titulo={buscando ? "Buscando…" : "Buscar ISBN"} deshabilitado={buscando} onPress={() => buscar(manual)} accessibilityLabel="Buscar libro por ISBN escrito" />

      {error ? (
        <View style={estilos.error} accessibilityRole="alert">
          <Icono nombre="alert-circle" color={colores.error} />
          <Text style={estilos.errorTexto}>{error}</Text>
        </View>
      ) : null}
      {error && ultimoIsbn.current ? (
        <Boton titulo="Reintentar" icono="refresh" variante="secundario" onPress={() => buscar(ultimoIsbn.current ?? "")} />
      ) : null}
    </ScrollView>
  );
}

const ESQ = 28;
const estilos = StyleSheet.create({
  contenedor: { padding: 20, gap: 14, width: "100%", maxWidth: ANCHO_MAX, alignSelf: "center" },
  camara: { height: 320, borderRadius: radio.l, overflow: "hidden", backgroundColor: "#000" },
  marco: { position: "absolute", left: "12%", right: "12%", top: "30%", bottom: "30%" },
  esquina: { position: "absolute", width: ESQ, height: ESQ, borderColor: "#FFFFFF" },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 10 },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 10 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 10 },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 10 },
  guia: { position: "absolute", bottom: 16, left: 0, right: 0, textAlign: "center", color: "#FFFFFF", fontWeight: "700", textShadowColor: "#000", textShadowRadius: 6 },
  cargando: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center" },
  tarjeta: { alignItems: "center", gap: 12, padding: 24, backgroundColor: colores.tarjeta, borderRadius: radio.l, ...sombra },
  iconoGrande: { width: 84, height: 84, borderRadius: 26, backgroundColor: colores.primarioSuave, alignItems: "center", justifyContent: "center" },
  tituloTarjeta: { fontSize: 20, fontWeight: "800", color: colores.texto },
  texto: { fontSize: 15, color: colores.suave, lineHeight: 22, textAlign: "center" },
  separador: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 4 },
  linea: { flex: 1, height: 1, backgroundColor: colores.borde },
  separadorTexto: { fontSize: 13, color: colores.suave, fontWeight: "600" },
  error: { flexDirection: "row", gap: 8, alignItems: "center", backgroundColor: colores.errorSuave, padding: 12, borderRadius: radio.m },
  errorTexto: { color: colores.error, fontSize: 14, flex: 1, fontWeight: "600" },
});
