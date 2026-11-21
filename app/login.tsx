import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Boton } from "@/components/Boton";
import { Campo } from "@/components/Campo";
import { Icono } from "@/components/Icono";
import { useFormularioSesion } from "@/hooks/useFormularioSesion";
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

function Marca() {
  return (
    <View style={estilos.marca}>
      <View style={estilos.logo}>
        <Icono nombre="library" tam={38} color={colores.primario} />
      </View>
      <Text style={estilos.titulo} accessibilityRole="header">
        Buscador de libros
      </Text>
      <Text style={estilos.lema}>Descubre libros y no olvides cuáles quieres leer.</Text>
    </View>
  );
}

type CampoPasswordProps = {
  valor: string;
  onCambiar: (t: string) => void;
  placeholder: string;
  autocompletar: "current-password" | "new-password";
  onEnviar: () => void;
};

function CampoPassword({ valor, onCambiar, placeholder, autocompletar, onEnviar }: CampoPasswordProps) {
  const [ver, setVer] = useState(false);
  return (
    <View>
      <Campo
        icono="lock-closed-outline"
        placeholder={placeholder}
        value={valor}
        onChangeText={onCambiar}
        secureTextEntry={!ver}
        autoComplete={autocompletar}
        accessibilityLabel="Contraseña"
        onSubmitEditing={onEnviar}
      />
      <Boton
        compacto
        variante="fantasma"
        icono={ver ? "eye-off-outline" : "eye-outline"}
        titulo={ver ? "Ocultar" : "Mostrar"}
        accessibilityLabel={ver ? "Ocultar contraseña" : "Mostrar contraseña"}
        onPress={() => setVer(!ver)}
        style={{ alignSelf: "flex-end" }}
      />
    </View>
  );
}

function MensajeError({ texto }: { texto: string }) {
  return (
    <View style={estilos.error} accessibilityRole="alert">
      <Icono nombre="alert-circle" color={colores.error} tam={18} />
      <Text style={estilos.errorTexto}>{texto}</Text>
    </View>
  );
}

export default function Login() {
  const f = useFormularioSesion();
  const t = TEXTOS[f.modoRegistro ? "registro" : "login"];
  return (
    <LinearGradient colors={degradado} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={estilos.contenedor} keyboardShouldPersistTaps="handled">
          <Marca />
          <View style={estilos.tarjeta}>
            <Text style={estilos.tarjetaTitulo}>{t.titulo}</Text>
            <Text style={estilos.suave}>{t.detalle}</Text>
            <Campo
              icono="mail-outline"
              placeholder="Correo electrónico"
              value={f.email}
              onChangeText={f.setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              accessibilityLabel="Correo electrónico"
            />
            <CampoPassword
              valor={f.password}
              onCambiar={f.setPassword}
              placeholder={t.password}
              autocompletar={t.autocompletar}
              onEnviar={f.enviar}
            />
            {f.error ? <MensajeError texto={f.error} /> : null}
            <Boton
              icono={t.icono}
              titulo={f.cargando ? "Un momento…" : t.boton}
              onPress={f.enviar}
              deshabilitado={f.cargando}
            />
            <Boton variante="fantasma" titulo={t.cambiar} onPress={f.cambiarModo} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    gap: 28,
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
  },
  marca: { alignItems: "center", gap: 10 },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    ...sombraFuerte,
  },
  titulo: { fontSize: 30, fontWeight: "800", color: "#FFFFFF", textAlign: "center", letterSpacing: -0.5 },
  lema: { fontSize: 15, color: "rgba(255,255,255,0.85)", textAlign: "center" },
  tarjeta: { backgroundColor: colores.tarjeta, borderRadius: radio.l + 6, padding: 24, gap: 14, ...sombraFuerte },
  tarjetaTitulo: { fontSize: 22, fontWeight: "800", color: colores.texto },
  suave: { fontSize: 14, color: colores.suave, marginTop: -8 },
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
