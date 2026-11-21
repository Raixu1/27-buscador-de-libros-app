import { Tabs } from "expo-router";
import { iconoTab } from "@/components/IconoTab";
import { colores } from "@/theme";

const iconoBuscar = iconoTab("search", "search-outline");
const iconoLista = iconoTab("library", "library-outline");

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colores.primario,
        tabBarInactiveTintColor: colores.suave,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "700" },
        tabBarStyle: {
          backgroundColor: colores.tarjeta,
          borderTopColor: colores.borde,
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Buscar", tabBarAccessibilityLabel: "Buscar libros", tabBarIcon: iconoBuscar }}
      />
      <Tabs.Screen
        name="mi-lista"
        options={{ title: "Mi lista", tabBarAccessibilityLabel: "Mi lista de lectura", tabBarIcon: iconoLista }}
      />
    </Tabs>
  );
}
