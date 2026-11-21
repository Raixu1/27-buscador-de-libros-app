import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { colores } from "@/theme";

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
        options={{
          title: "Buscar",
          tabBarAccessibilityLabel: "Buscar libros",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? "search" : "search-outline"} color={String(color)} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="mi-lista"
        options={{
          title: "Mi lista",
          tabBarAccessibilityLabel: "Mi lista de lectura",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? "library" : "library-outline"} color={String(color)} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
