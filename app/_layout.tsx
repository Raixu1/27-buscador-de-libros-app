import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SessionProvider, useSesion } from "@/session/SessionProvider";
import { colores } from "@/theme";

function Navegacion() {
  const { estado } = useSesion();
  if (estado === "cargando") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }} accessibilityLabel="Cargando">
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }
  const autenticado = estado === "autenticado";
  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: colores.fondo }, headerTintColor: colores.texto }}>
      <Stack.Protected guard={autenticado}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="libro/[id]" options={{ title: "Detalle" }} />
        <Stack.Screen name="escaner" options={{ title: "Escanear ISBN" }} />
      </Stack.Protected>
      <Stack.Protected guard={!autenticado}>
        <Stack.Screen name="login" options={{ title: "Buscador de libros", headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SessionProvider>
        <StatusBar style="dark" />
        <Navegacion />
      </SessionProvider>
    </GestureHandlerRootView>
  );
}
