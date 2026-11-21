import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ApiError } from "@/api/client";
import { Boton } from "@/components/Boton";
import { useSesion } from "@/session/SessionProvider";
import { validarEmail, validarPassword } from "@/services/validacion";
import { colores } from "@/theme";

export default function Login() {
  const { iniciarSesion, registrar } = useSesion();
  const [modoRegistro, setModoRegistro] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={estilos.contenedor} keyboardShouldPersistTaps="handled">
        <Text style={estilos.titulo} accessibilityRole="header">
          📚 Buscador de libros
        </Text>
        <Text style={estilos.suave}>{modoRegistro ? "Crea tu cuenta" : "Inicia sesión para ver tu lista"}</Text>

        <TextInput
          style={estilos.input}
          placeholder="Correo"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          accessibilityLabel="Correo electrónico"
        />
        <TextInput
          style={estilos.input}
          placeholder={modoRegistro ? "Contraseña (mínimo 8 caracteres)" : "Contraseña"}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete={modoRegistro ? "new-password" : "current-password"}
          accessibilityLabel="Contraseña"
        />
        {error ? (
          <Text style={estilos.error} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
        <View style={{ gap: 12 }}>
          <Boton
            titulo={cargando ? "Un momento…" : modoRegistro ? "Crear cuenta" : "Iniciar sesión"}
            onPress={enviar}
            deshabilitado={cargando}
          />
          <Boton
            variante="secundario"
            titulo={modoRegistro ? "Ya tengo cuenta" : "Crear una cuenta"}
            onPress={() => {
              setModoRegistro(!modoRegistro);
              setError(null);
            }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flexGrow: 1, justifyContent: "center", padding: 24, gap: 16, backgroundColor: colores.fondo },
  titulo: { fontSize: 28, fontWeight: "800", color: colores.texto, textAlign: "center" },
  suave: { fontSize: 16, color: colores.suave, textAlign: "center" },
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
