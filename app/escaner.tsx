import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ApiError } from "@/api/client";
import { libroPorIsbn } from "@/api/endpoints";
import { Boton } from "@/components/Boton";
import { abrirLibro } from "@/navigation";
import { vibrarExito } from "@/services/haptics";
import { normalizarIsbn } from "@/services/isbn";
import { colores } from "@/theme";

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

  const puedeUsarCamara = camaraDisponible !== false;

  return (
    <ScrollView contentContainerStyle={estilos.contenedor} keyboardShouldPersistTaps="handled">
      {puedeUsarCamara ? (
        camaraActiva && permiso?.granted ? (
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
          </View>
        ) : (
          <View style={estilos.caja}>
            <Text style={estilos.texto}>
              Usaremos la cámara solo para leer el código de barras (ISBN) del libro. No se guardan fotos.
            </Text>
            <Boton titulo="📷 Activar cámara" onPress={activarCamara} accessibilityLabel="Activar la cámara para escanear" />
          </View>
        )
      ) : (
        <Text style={estilos.texto}>La cámara no está disponible en este dispositivo. Escribe el ISBN.</Text>
      )}

      <Text style={estilos.etiqueta}>O escribe el ISBN</Text>
      <TextInput
        style={estilos.input}
        value={manual}
        onChangeText={setManual}
        placeholder="978-0-306-40615-7"
        keyboardType="default"
        autoCapitalize="characters"
        accessibilityLabel="ISBN"
      />
      <Boton
        titulo={buscando ? "Buscando…" : "Buscar ISBN"}
        deshabilitado={buscando}
        onPress={() => buscar(manual)}
        accessibilityLabel="Buscar libro por ISBN escrito"
      />
      {error ? (
        <View style={{ gap: 8 }} accessibilityRole="alert">
          <Text style={estilos.error}>{error}</Text>
          {ultimoIsbn.current ? (
            <Boton titulo="Reintentar" variante="secundario" onPress={() => buscar(ultimoIsbn.current ?? "")} />
          ) : null}
        </View>
      ) : null}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { padding: 20, gap: 12, backgroundColor: colores.fondo },
  camara: { height: 280, borderRadius: 12, overflow: "hidden", backgroundColor: "#000" },
  caja: { gap: 12, padding: 16, backgroundColor: colores.tarjeta, borderRadius: 12 },
  texto: { fontSize: 15, color: colores.texto, lineHeight: 22 },
  etiqueta: { fontSize: 14, fontWeight: "700", color: colores.suave, marginTop: 8 },
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
});
