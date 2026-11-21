import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colores } from "@/theme";

const icono = (emoji: string) => () => <Text style={{ fontSize: 20 }}>{emoji}</Text>;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colores.primario,
        headerStyle: { backgroundColor: colores.fondo },
        headerTintColor: colores.texto,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Buscar", tabBarIcon: icono("🔎"), tabBarAccessibilityLabel: "Buscar libros" }}
      />
      <Tabs.Screen
        name="mi-lista"
        options={{ title: "Mi lista", tabBarIcon: icono("📚"), tabBarAccessibilityLabel: "Mi lista de lectura" }}
      />
    </Tabs>
  );
}
