import { CameraView } from "expo-camera";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Boton } from "@/components/Boton";
import { Icono } from "@/components/Icono";
import { colores, radio, sombra } from "@/theme";

const ESQUINAS = ["tl", "tr", "bl", "br"] as const;

function Esquinas() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={estilos.marco}>
        {ESQUINAS.map((e) => (
          <View key={e} style={[estilos.esquina, estilos[e]]} />
        ))}
      </View>
      <Text style={estilos.guia}>Centra el código de barras del libro</Text>
    </View>
  );
}

/** Cámara leyendo solo EAN-13 (el código de barras del ISBN). */
export function VisorCamara({ onCodigo, buscando }: { onCodigo: (data: string) => void; buscando: boolean }) {
  return (
    <View style={estilos.camara} accessible accessibilityLabel="Cámara para escanear el código de barras">
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["ean13"] }}
        onBarcodeScanned={({ data }) => onCodigo(data)}
      />
      <Esquinas />
      {buscando ? (
        <View style={estilos.cargando}>
          <ActivityIndicator color="#FFFFFF" size="large" />
        </View>
      ) : null}
    </View>
  );
}

/** Explica para qué se usa la cámara antes de pedir el permiso. */
export function ActivarCamara({ onActivar }: { onActivar: () => void }) {
  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.iconoGrande}>
        <Icono nombre="barcode-outline" tam={44} color={colores.primario} />
      </View>
      <Text style={estilos.titulo}>Escanea el ISBN</Text>
      <Text style={estilos.texto}>
        Usaremos la cámara solo para leer el código de barras del libro. No se guardan fotos.
      </Text>
      <Boton
        icono="camera-outline"
        titulo="Activar cámara"
        onPress={onActivar}
        accessibilityLabel="Activar la cámara para escanear"
        style={{ alignSelf: "stretch" }}
      />
    </View>
  );
}

export function SinCamara() {
  return (
    <View style={estilos.tarjeta}>
      <Icono nombre="camera-reverse-outline" tam={32} color={colores.suave} />
      <Text style={estilos.texto}>La cámara no está disponible en este dispositivo. Escribe el ISBN abajo.</Text>
    </View>
  );
}

const ESQ = 28;
const estilos = StyleSheet.create({
  camara: { height: 320, borderRadius: radio.l, overflow: "hidden", backgroundColor: "#000" },
  marco: { position: "absolute", left: "12%", right: "12%", top: "30%", bottom: "30%" },
  esquina: { position: "absolute", width: ESQ, height: ESQ, borderColor: "#FFFFFF" },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 10 },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 10 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 10 },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 10 },
  guia: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#FFFFFF",
    fontWeight: "700",
    textShadowColor: "#000",
    textShadowRadius: 6,
  },
  cargando: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  tarjeta: {
    alignItems: "center",
    gap: 12,
    padding: 24,
    backgroundColor: colores.tarjeta,
    borderRadius: radio.l,
    ...sombra,
  },
  iconoGrande: {
    width: 84,
    height: 84,
    borderRadius: 26,
    backgroundColor: colores.primarioSuave,
    alignItems: "center",
    justifyContent: "center",
  },
  titulo: { fontSize: 20, fontWeight: "800", color: colores.texto },
  texto: { fontSize: 15, color: colores.suave, lineHeight: 22, textAlign: "center" },
});
