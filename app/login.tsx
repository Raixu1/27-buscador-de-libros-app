import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { ApiError } from "@/api/client";
import { Boton } from "@/components/Boton";
import { Campo } from "@/components/Campo";
import { Icono } from "@/components/Icono";
import { useSesion } from "@/session/SessionProvider";
import { validarEmail, validarPassword } from "@/services/validacion";
import { colores, degradado, radio, sombraFuerte } from "@/theme";

const TEXTOS = {
  login: {
    titulo: "Bienvenido de nuevo",
    detalle: "Inicia sesión para ver tu lista de lectura.",
    password: "Contraseña",
    autocompletar: "current-password",
    boton: "Iniciar sesión",
    icono: "log-in-outline",
    cambiar: "¿No tienes cuenta? Regístrate",
  },
  registro: {
    titulo: "Crea tu cuenta",
    detalle: "Tu lista se guarda en el teléfono y en la nube.",
    password: "Contraseña (mínimo 8 caracteres)",
    autocompletar: "new-password",
    boton: "Crear cuenta",
    icono: "person-add",
    cambiar: "¿Ya tienes cuenta? Inicia sesión",
  },
} as const;

export default function Login() {
  const { iniciarSesion, registrar } = useSesion();
  const [modoRegistro, setModoRegistro] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const t = TEXTOS[modoRegistro ? "registro" : "login"];

  const enviar = async () => {
    const invalido = validarEmail(email) ?? (modoRegistro ? validarPassword(password) : null);
    if (invalido) return setError(invalido);
    if (!password) return setError("Escribe tu contraseña.");
    setError(null);
    setCargando(true);
    try {
      await (modoRegistro ? registrar(email, password) : iniciarSesion(email, password));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo iniciar sesión.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <LinearGradient colors={degradado} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <View style={[estilos.circulo, { width: 260, height: 260, top: -80, right: -90 }]} pointerEvents="none" />
      <View style={[estilos.circulo, { width: 160, height: 160, bottom: 40, left: -60 }]} pointerEvents="none" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={estilos.contenedor} keyboardShouldPersistTaps="handled">
          <View style={estilos.marca}>
            <View style={estilos.logo}>
              <Icono nombre="library" tam={38} color={colores.primario} />
            </View>
            <Text style={estilos.titulo} accessibilityRole="header">
              Buscador de libros
            </Text>
            <Text style={estilos.lema}>Descubre libros y no olvides cuáles quieres leer.</Text>
          </View>

          <View style={estilos.tarjeta}>
            <Text style={estilos.tarjetaTitulo}>{t.titulo}</Text>
            <Text style={estilos.suave}>
              {t.detalle}
            </Text>
            <Campo
              icono="mail-outline"
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              accessibilityLabel="Correo electrónico"
            />
            <View>
              <Campo
                icono="lock-closed-outline"
                placeholder={t.password}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!verPassword}
                autoComplete={t.autocompletar}
                accessibilityLabel="Contraseña"
                onSubmitEditing={enviar}
              />
              <Boton
                compacto
                variante="fantasma"
                icono={verPassword ? "eye-off-outline" : "eye-outline"}
                titulo={verPassword ? "Ocultar" : "Mostrar"}
                accessibilityLabel={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                onPress={() => setVerPassword(!verPassword)}
                style={{ alignSelf: "flex-end" }}
              />
            </View>
            {error ? (
              <View style={estilos.error} accessibilityRole="alert">
                <Icono nombre="alert-circle" color={colores.error} tam={18} />
                <Text style={estilos.errorTexto}>{error}</Text>
              </View>
            ) : null}
            <Boton
              icono={t.icono}
              titulo={cargando ? "Un momento…" : t.boton}
              onPress={enviar}
              deshabilitado={cargando}
            />
            <Boton
              variante="fantasma"
              titulo={t.cambiar}
              onPress={() => {
                setModoRegistro(!modoRegistro);
                setError(null);
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const estilos = StyleSheet.create({
  circulo: { position: "absolute", borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)" },
  contenedor: { flexGrow: 1, justifyContent: "center", padding: 24, gap: 28, width: "100%", maxWidth: 460, alignSelf: "center" },
  marca: { alignItems: "center", gap: 10 },
  logo: { width: 76, height: 76, borderRadius: 24, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", ...sombraFuerte },
  titulo: { fontSize: 30, fontWeight: "800", color: "#FFFFFF", textAlign: "center", letterSpacing: -0.5 },
  lema: { fontSize: 15, color: "rgba(255,255,255,0.85)", textAlign: "center" },
  tarjeta: { backgroundColor: colores.tarjeta, borderRadius: radio.l + 6, padding: 24, gap: 14, ...sombraFuerte },
  tarjetaTitulo: { fontSize: 22, fontWeight: "800", color: colores.texto },
  suave: { fontSize: 14, color: colores.suave, marginTop: -8 },
  error: { flexDirection: "row", gap: 8, alignItems: "center", backgroundColor: colores.errorSuave, padding: 12, borderRadius: radio.m },
  errorTexto: { color: colores.error, fontSize: 14, flex: 1, fontWeight: "600" },
});
